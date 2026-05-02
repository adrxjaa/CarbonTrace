from pydantic import BaseModel


class ActivityTrendPoint(BaseModel):
    date: str          # ISO date string "2025-04-15"
    co2_kg: float
    credits: float
    submission_count: int


class SubmissionStats(BaseModel):
    total: int
    pending: int
    verified: int
    flagged: int
    rejected: int


class DashboardResponse(BaseModel):
    # Hero metric
    monthly_co2_kg: float

    # Stats strip
    total_credits: float
    credits_today: float
    submission_stats: SubmissionStats
    verify_rate: float          # 0–100 percentage
    verify_rate_delta: float    # vs last month

    # 14-day activity trend
    activity_trend: list[ActivityTrendPoint]
