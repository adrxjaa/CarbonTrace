from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser
from services.leaderboard_service import get_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", summary="Get ranked leaderboard for all citizens")
async def leaderboard(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    period: str = Query(default="month", pattern="^(month|all)$"),
) -> dict:
    return await get_leaderboard(db, current_user.id, period=period)
