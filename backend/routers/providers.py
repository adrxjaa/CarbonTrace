import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentAdmin
from models.provider_application import ProviderApplication
from schemas.provider import (
    ProviderApplicationCreate,
    ProviderApplicationOut,
    SponsorApplicationCreate,
)

router = APIRouter(prefix="/providers", tags=["Provider & Sponsor Applications"])


@router.post(
    "/apply",
    response_model=ProviderApplicationOut,
    status_code=201,
    summary="Submit a Sustainable Provider application",
    description=(
        "Public endpoint — no authentication required. "
        "Application enters PENDING state and is reviewed by an admin (3–5 business days)."
    ),
)
async def apply_provider(
    data: ProviderApplicationCreate,
    db: AsyncSession = Depends(get_db),
) -> ProviderApplicationOut:
    # Check for duplicate application by contact email
    result = await db.execute(
        select(ProviderApplication).where(
            ProviderApplication.contact_email == data.contact_email,
            ProviderApplication.status.in_(["PENDING", "UNDER_REVIEW", "APPROVED"]),
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active application for this email already exists",
        )

    application = ProviderApplication(
        id=uuid.uuid4(),
        org_name=data.org_name,
        provider_type=data.provider_type,
        operating_region=data.operating_region,
        website=data.website,
        contact_name=data.contact_name,
        contact_email=str(data.contact_email),
        contact_designation=data.contact_designation,
        activity_description=data.activity_description,
        expected_monthly_volume=data.expected_monthly_volume,
        status="PENDING",
    )
    db.add(application)
    await db.flush()

    print(f"\n[ProviderService] New application from {data.org_name} ({data.contact_email})")
    return ProviderApplicationOut.model_validate(application)


@router.post(
    "/sponsor/apply",
    status_code=201,
    summary="Submit a Corporate Sponsor application",
    description="Public endpoint for corporate sponsors. Stored for admin review.",
)
async def apply_sponsor(
    data: SponsorApplicationCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Reuse ProviderApplication table with provider_type="sponsor"
    application = ProviderApplication(
        id=uuid.uuid4(),
        org_name=data.entity_name,
        provider_type="sponsor",
        operating_region=data.industry_sector,
        website=data.corporate_website,
        contact_name=data.entity_name,
        contact_email=str(data.contact_email),
        activity_description=data.sustainability_goals,
        expected_monthly_volume=data.tax_id,
        status="PENDING",
    )
    db.add(application)
    await db.flush()

    print(f"\n[SponsorService] New sponsor application from {data.entity_name} ({data.contact_email})")
    return {
        "id": str(application.id),
        "status": "PENDING",
        "message": "Sponsor application submitted. Our team will contact you within 3–5 business days.",
    }


@router.get(
    "/status/{application_id}",
    response_model=ProviderApplicationOut,
    summary="Check the status of a provider application",
)
async def application_status(
    application_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ProviderApplicationOut:
    result = await db.execute(
        select(ProviderApplication).where(ProviderApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return ProviderApplicationOut.model_validate(application)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get(
    "/admin/provider-applications",
    summary="[Admin] List all provider applications (non-sponsor)",
)
async def admin_list_provider_applications(
    _: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict[str, Any]:
    q = select(ProviderApplication).where(ProviderApplication.provider_type != "sponsor")
    if status_filter:
        q = q.where(ProviderApplication.status == status_filter)
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar() or 0
    q = q.order_by(ProviderApplication.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    # Counts by status
    counts_q = await db.execute(
        select(ProviderApplication.status, func.count())
        .where(ProviderApplication.provider_type != "sponsor")
        .group_by(ProviderApplication.status)
    )
    status_counts = {row[0]: row[1] for row in counts_q.all()}

    return {
        "items": [ProviderApplicationOut.model_validate(a) for a in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
        "status_counts": status_counts,
    }


@router.get(
    "/admin/sponsor-applications",
    summary="[Admin] List all sponsor applications",
)
async def admin_list_sponsor_applications(
    _: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict[str, Any]:
    q = select(ProviderApplication).where(ProviderApplication.provider_type == "sponsor")
    if status_filter:
        q = q.where(ProviderApplication.status == status_filter)
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar() or 0
    q = q.order_by(ProviderApplication.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    items = result.scalars().all()

    counts_q = await db.execute(
        select(ProviderApplication.status, func.count())
        .where(ProviderApplication.provider_type == "sponsor")
        .group_by(ProviderApplication.status)
    )
    status_counts = {row[0]: row[1] for row in counts_q.all()}

    return {
        "items": [ProviderApplicationOut.model_validate(a) for a in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
        "status_counts": status_counts,
    }
