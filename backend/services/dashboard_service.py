import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.credit import CarbonCredit
from models.submission import Submission
from schemas.dashboard import ActivityTrendPoint, DashboardResponse, SubmissionStats


async def get_dashboard_stats(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> DashboardResponse:
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # ── Monthly CO₂ ──────────────────────────────────────────────────────────
    co2_result = await db.execute(
        select(func.coalesce(func.sum(CarbonCredit.co2_kg), 0.0))
        .where(
            and_(
                CarbonCredit.user_id == user_id,
                CarbonCredit.status == "confirmed",
                CarbonCredit.created_at >= month_start,
            )
        )
    )
    monthly_co2 = float(co2_result.scalar_one())

    # ── Total credits ─────────────────────────────────────────────────────────
    credits_result = await db.execute(
        select(func.coalesce(func.sum(CarbonCredit.credit_amount), 0.0))
        .where(
            and_(CarbonCredit.user_id == user_id, CarbonCredit.status == "confirmed")
        )
    )
    total_credits = float(credits_result.scalar_one())

    # ── Credits today ─────────────────────────────────────────────────────────
    today_result = await db.execute(
        select(func.coalesce(func.sum(CarbonCredit.credit_amount), 0.0))
        .where(
            and_(
                CarbonCredit.user_id == user_id,
                CarbonCredit.status == "confirmed",
                CarbonCredit.created_at >= day_start,
            )
        )
    )
    credits_today = float(today_result.scalar_one())

    # ── Submission stats ──────────────────────────────────────────────────────
    subs_result = await db.execute(
        select(Submission.status, func.count(Submission.id))
        .where(Submission.user_id == user_id)
        .group_by(Submission.status)
    )
    status_counts: dict[str, int] = {row[0]: row[1] for row in subs_result.all()}
    total_subs = sum(status_counts.values())
    verified_count = status_counts.get("VERIFIED", 0)
    verify_rate = round((verified_count / total_subs * 100) if total_subs else 0.0, 1)

    sub_stats = SubmissionStats(
        total=total_subs,
        pending=status_counts.get("PENDING", 0),
        verified=verified_count,
        flagged=status_counts.get("FLAGGED", 0),
        rejected=status_counts.get("REJECTED", 0),
    )

    # ── 14-day activity trend ─────────────────────────────────────────────────
    trend: list[ActivityTrendPoint] = []
    for days_back in range(13, -1, -1):
        day = (now - timedelta(days=days_back)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        next_day = day + timedelta(days=1)

        day_credits = await db.execute(
            select(
                func.coalesce(func.sum(CarbonCredit.credit_amount), 0.0),
                func.coalesce(func.sum(CarbonCredit.co2_kg), 0.0),
                func.count(CarbonCredit.id),
            )
            .where(
                and_(
                    CarbonCredit.user_id == user_id,
                    CarbonCredit.status == "confirmed",
                    CarbonCredit.created_at >= day,
                    CarbonCredit.created_at < next_day,
                )
            )
        )
        row = day_credits.one()
        trend.append(
            ActivityTrendPoint(
                date=day.date().isoformat(),
                credits=float(row[0]),
                co2_kg=float(row[1]),
                submission_count=int(row[2]),
            )
        )

    return DashboardResponse(
        monthly_co2_kg=round(monthly_co2, 2),
        total_credits=round(total_credits, 2),
        credits_today=round(credits_today, 2),
        submission_stats=sub_stats,
        verify_rate=verify_rate,
        verify_rate_delta=2.0,  # Static for MVP; Stage 2 compares to previous month
        activity_trend=trend,
    )
