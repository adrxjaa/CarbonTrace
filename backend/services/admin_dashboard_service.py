from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from models.submission import Submission
from models.provider_application import ProviderApplication
from schemas.admin_dashboard import (
    AdminDashboardResponse,
    AdminDashboardStats,
    AdminProviderApp,
    AdminFlaggedSubmission,
)


async def get_admin_dashboard_data(db: AsyncSession) -> AdminDashboardResponse:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # 1. Stats
    # Active Users (just all verified users for now)
    active_users_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_verified == True)
    )
    active_users = active_users_result.scalar() or 0

    # Pending Submissions
    pending_subs_result = await db.execute(
        select(func.count()).select_from(Submission).where(Submission.status == "PENDING")
    )
    pending_subs = pending_subs_result.scalar() or 0

    # Flagged Submissions
    flagged_subs_result = await db.execute(
        select(func.count()).select_from(Submission).where(Submission.status == "FLAGGED")
    )
    flagged_subs = flagged_subs_result.scalar() or 0

    # Flagged Today
    flagged_today_result = await db.execute(
        select(func.count()).select_from(Submission).where(
            Submission.status == "FLAGGED",
            Submission.created_at >= today_start
        )
    )
    flagged_today = flagged_today_result.scalar() or 0

    # Blockchain Sync Status (Mocked for now)
    sync_status = "Block 14.2M"

    stats = AdminDashboardStats(
        active_users=active_users,
        active_users_delta="+12%",  # Mock delta for UI
        pending_submissions=pending_subs,
        flagged_submissions=flagged_subs,
        flagged_today=flagged_today,
        blockchain_sync_status=sync_status,
    )

    # 2. Sponsor Applications Queue (latest 5)
    sponsor_result = await db.execute(
        select(ProviderApplication)
        .where(ProviderApplication.provider_type == "sponsor")
        .order_by(desc(ProviderApplication.created_at))
        .limit(5)
    )
    sponsor_apps = sponsor_result.scalars().all()
    sponsor_queue = [
        AdminProviderApp(
            id=app.id,
            org_name=app.org_name,
            provider_type=app.provider_type,
            status=app.status,
            applied_on=app.created_at,
        )
        for app in sponsor_apps
    ]

    # 3. Provider Applications Queue (latest 5)
    provider_result = await db.execute(
        select(ProviderApplication)
        .where(ProviderApplication.provider_type != "sponsor")
        .order_by(desc(ProviderApplication.created_at))
        .limit(5)
    )
    provider_apps = provider_result.scalars().all()
    provider_queue = [
        AdminProviderApp(
            id=app.id,
            org_name=app.org_name,
            provider_type=app.provider_type,
            status=app.status,
            applied_on=app.created_at,
        )
        for app in provider_apps
    ]

    # 4. Flagged Submissions Grid (latest 4)
    flagged_list_result = await db.execute(
        select(Submission)
        .where(Submission.status == "FLAGGED")
        .order_by(desc(Submission.created_at))
        .limit(4)
    )
    flagged_list = flagged_list_result.scalars().all()
    flagged_submissions = [
        AdminFlaggedSubmission(
            id=sub.id,
            activity_type=sub.activity_type,
            user_id=sub.user_id,
            confidence=sub.verification_confidence,
            flag_reason=sub.flag_reason,
            image_url=sub.evidence_url,
        )
        for sub in flagged_list
    ]

    return AdminDashboardResponse(
        stats=stats,
        sponsor_queue=sponsor_queue,
        provider_queue=provider_queue,
        flagged_submissions=flagged_submissions,
    )
