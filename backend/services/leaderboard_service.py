import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.credit import CarbonCredit
from models.submission import Submission
from models.user import User


async def get_leaderboard(
    db: AsyncSession,
    current_user_id: uuid.UUID,
    period: str = "month",
) -> dict:
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if period == "all":
        period_start = datetime(2020, 1, 1, tzinfo=timezone.utc)

    # Aggregate per citizen user
    result = await db.execute(
        select(
            User.id,
            User.name,
            User.location,
            func.coalesce(func.sum(CarbonCredit.credit_amount), 0.0).label("total_credits"),
            func.coalesce(func.sum(CarbonCredit.co2_kg), 0.0).label("total_co2_kg"),
            func.coalesce(func.count(CarbonCredit.id), 0).label("activity_count"),
        )
        .outerjoin(
            CarbonCredit,
            and_(
                CarbonCredit.user_id == User.id,
                CarbonCredit.status == "confirmed",
                CarbonCredit.created_at >= period_start,
            ),
        )
        .where(User.role == "citizen", User.is_active == True)  # noqa: E712
        .group_by(User.id, User.name, User.location)
        .order_by(func.coalesce(func.sum(CarbonCredit.co2_kg), 0.0).desc())
    )
    rows = result.all()

    ranked = []
    for rank, row in enumerate(rows, start=1):
        ranked.append({
            "rank": rank,
            "user_id": str(row.id),
            "name": row.name,
            "location": row.location or "",
            "total_credits": float(row.total_credits),
            "total_co2_kg": float(row.total_co2_kg),
            "activity_count": int(row.activity_count),
            "is_current_user": row.id == current_user_id,
        })

    # Current user rank info
    current = next((r for r in ranked if r["is_current_user"]), None)
    total_users = len(ranked)
    if current and total_users > 0:
        percentile = round((1 - (current["rank"] - 1) / total_users) * 100)
    else:
        percentile = 0

    return {
        "period": period,
        "total_participants": total_users,
        "rankings": ranked,
        "current_user": current,
        "current_user_percentile": percentile,
    }
