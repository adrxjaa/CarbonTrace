import math
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.submission import Submission
from schemas.submission import SubmissionCreate, SubmissionFilter, SubmissionListOut, SubmissionOut

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "application/pdf"
}


async def create_submission(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: SubmissionCreate,
) -> Submission:
    """Create a new PENDING submission."""
    submission = Submission(
        id=uuid.uuid4(),
        user_id=user_id,
        activity_type=data.activity_type,
        metadata_json=data.metadata_json,
        activity_timestamp=data.activity_timestamp,
        location=data.location,
        status="PENDING",
    )
    db.add(submission)
    await db.flush()
    return submission


async def upload_evidence(
    db: AsyncSession,
    submission: Submission,
    file: UploadFile,
) -> Submission:
    """Save uploaded evidence file and attach URL to submission."""
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WebP, PDF",
        )

    # Validate file size
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb}MB",
        )

    # Build storage path
    upload_dir = Path(settings.upload_dir) / str(submission.user_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "upload").suffix or ".bin"
    filename = f"{submission.id}{ext}"
    file_path = upload_dir / filename

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    # Store relative URL (serve via static files or S3 in production)
    submission.evidence_url = f"/uploads/{submission.user_id}/{filename}"
    submission.evidence_filename = file.filename
    await db.flush()
    return submission


async def get_submission(
    db: AsyncSession,
    submission_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Submission:
    """Fetch a submission, enforcing ownership."""
    result = await db.execute(
        select(Submission).where(
            and_(Submission.id == submission_id, Submission.user_id == user_id)
        )
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return submission


async def list_submissions(
    db: AsyncSession,
    user_id: uuid.UUID,
    filters: SubmissionFilter,
) -> SubmissionListOut:
    """Return paginated, filtered list of submissions for a user."""
    query = select(Submission).where(Submission.user_id == user_id)

    if filters.status:
        query = query.where(Submission.status == filters.status.upper())
    if filters.activity_type:
        query = query.where(Submission.activity_type == filters.activity_type)
    if filters.date_from:
        query = query.where(Submission.activity_timestamp >= filters.date_from)
    if filters.date_to:
        query = query.where(Submission.activity_timestamp <= filters.date_to)

    # Count total before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Apply ordering and pagination
    offset = (filters.page - 1) * filters.page_size
    query = query.order_by(Submission.created_at.desc()).offset(offset).limit(filters.page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return SubmissionListOut(
        items=[SubmissionOut.model_validate(s) for s in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
        total_pages=math.ceil(total / filters.page_size) if total else 0,
    )
