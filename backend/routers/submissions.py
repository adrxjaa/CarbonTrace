import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser, check_submission_rate_limit
from schemas.submission import (
    SubmissionCreate,
    SubmissionFilter,
    SubmissionListOut,
    SubmissionOut,
)
from services.submission_service import (
    create_submission,
    get_submission,
    list_submissions,
    upload_evidence,
)
from services.verification_service import run_ai_verification

router = APIRouter(prefix="/submissions", tags=["Activity Submissions"])


@router.post(
    "",
    response_model=SubmissionOut,
    status_code=201,
    summary="Create a new activity submission",
    description=(
        "Creates a PENDING submission and immediately enqueues AI verification "
        "as a background task. Rate limited: 10 requests/minute per IP."
    ),
    dependencies=[Depends(check_submission_rate_limit)],
)
async def create(
    data: SubmissionCreate,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> SubmissionOut:
    submission = await create_submission(db, current_user.id, data)
    await db.commit()  # Ensure the row is visible for immediate subsequent requests (e.g. upload)
    
    # Enqueue AI verification — runs asynchronously after response is sent
    background_tasks.add_task(run_ai_verification, submission.id)
    return SubmissionOut.model_validate(submission)


@router.post(
    "/{submission_id}/upload",
    response_model=SubmissionOut,
    summary="Upload evidence file for an existing submission",
    description="Accepts JPEG, PNG, WebP, or PDF. Max 10MB. Overwrites previous evidence.",
)
async def upload(
    submission_id: uuid.UUID,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> SubmissionOut:
    submission = await get_submission(db, submission_id, current_user.id)
    submission = await upload_evidence(db, submission, file)
    return SubmissionOut.model_validate(submission)


@router.get(
    "",
    response_model=SubmissionListOut,
    summary="List submissions with optional filters and pagination",
)
async def list_all(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(default=None, description="PENDING|VERIFIED|FLAGGED|REJECTED"),
    activity_type: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> SubmissionListOut:
    filters = SubmissionFilter(
        status=status,
        activity_type=activity_type,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
    return await list_submissions(db, current_user.id, filters)


@router.get(
    "/{submission_id}",
    response_model=SubmissionOut,
    summary="Get a single submission by ID",
)
async def get_one(
    submission_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> SubmissionOut:
    submission = await get_submission(db, submission_id, current_user.id)
    return SubmissionOut.model_validate(submission)


# ── Admin endpoints ────────────────────────────────────────────────────────────

from fastapi import Query as FQuery
from pydantic import BaseModel
from sqlalchemy import func, select as sa_select, desc
from core.deps import CurrentAdmin
from models.submission import Submission
from models.user import User


@router.get(
    "/admin/all",
    summary="[Admin] List all submissions across all users",
)
async def admin_list_all_submissions(
    _: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
    status: str | None = FQuery(default=None, description="PENDING|VERIFIED|FLAGGED|REJECTED"),
    activity_type: str | None = FQuery(default=None),
    page: int = FQuery(default=1, ge=1),
    page_size: int = FQuery(default=20, ge=1, le=100),
) -> dict:
    q = sa_select(Submission)
    if status:
        q = q.where(Submission.status == status)
    if activity_type:
        q = q.where(Submission.activity_type == activity_type)

    total_result = await db.execute(sa_select(func.count()).select_from(q.subquery()))
    total = total_result.scalar() or 0

    q = q.order_by(desc(Submission.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    # Status counts
    counts_q = await db.execute(
        sa_select(Submission.status, func.count()).group_by(Submission.status)
    )
    status_counts = {row[0]: row[1] for row in counts_q.all()}

    return {
        "items": [SubmissionOut.model_validate(s) for s in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
        "status_counts": status_counts,
    }


class StatusUpdateBody(BaseModel):
    status: str
    reason: str | None = None


@router.patch(
    "/admin/{submission_id}/status",
    response_model=SubmissionOut,
    summary="[Admin] Update submission status (approve / reject / flag)",
)
async def admin_update_status(
    submission_id: uuid.UUID,
    body: StatusUpdateBody,
    _: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
) -> SubmissionOut:
    from fastapi import HTTPException
    allowed = {"VERIFIED", "REJECTED", "FLAGGED", "PENDING"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")

    result = await db.execute(sa_select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = body.status
    if body.reason is not None:
        sub.flag_reason = body.reason
    await db.commit()
    await db.refresh(sub)
    return SubmissionOut.model_validate(sub)


@router.get(
    "/admin/audit",
    summary="[Admin] Audit log — recent submission status changes and events",
)
async def admin_audit_log(
    _: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
    page: int = FQuery(default=1, ge=1),
    page_size: int = FQuery(default=20, ge=1, le=100),
    search: str | None = FQuery(default=None),
    status: str | None = FQuery(default=None),
) -> dict:
    q = sa_select(Submission)
    if status:
        q = q.where(Submission.status == status)
    if search:
        search_term = f"%{search}%"
        from sqlalchemy import or_, cast, String
        q = q.where(
            or_(
                cast(Submission.id, String).ilike(search_term),
                cast(Submission.user_id, String).ilike(search_term),
                Submission.activity_type.ilike(search_term),
                Submission.flag_reason.ilike(search_term),
            )
        )

    total_result = await db.execute(sa_select(func.count()).select_from(q.subquery()))
    total = total_result.scalar() or 0

    q = q.order_by(desc(Submission.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    return {
        "items": [SubmissionOut.model_validate(s) for s in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
    }
