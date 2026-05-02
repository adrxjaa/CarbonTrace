from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser
from schemas.dashboard import DashboardResponse
from services.dashboard_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get full dashboard statistics for the authenticated user",
    description=(
        "Returns monthly CO₂ offset, credit balance, submission counts, "
        "verify rate, and 14-day activity trend. All values are live from DB."
    ),
)
async def get_dashboard(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    return await get_dashboard_stats(db, current_user.id)


from schemas.admin_dashboard import AdminDashboardResponse
from services.admin_dashboard_service import get_admin_dashboard_data

@router.get(
    "/admin",
    response_model=AdminDashboardResponse,
    summary="Get admin dashboard statistics and queues",
    description="Returns data for the admin dashboard (stats, sponsor/provider queues, flagged submissions).",
)
async def get_admin_dashboard(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> AdminDashboardResponse:
    # Optional: check if current_user.role == "admin"
    # Assuming role checks might be handled at the gateway or UI, but good to add if needed.
    return await get_admin_dashboard_data(db)
