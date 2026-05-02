import uuid
from datetime import datetime
from pydantic import BaseModel


class AdminDashboardStats(BaseModel):
    active_users: int
    active_users_delta: str  # e.g., "+12%"
    pending_submissions: int
    flagged_submissions: int
    flagged_today: int
    blockchain_sync_status: str


class AdminProviderApp(BaseModel):
    id: uuid.UUID
    org_name: str
    provider_type: str
    status: str
    applied_on: datetime


class AdminFlaggedSubmission(BaseModel):
    id: uuid.UUID
    activity_type: str
    user_id: uuid.UUID
    confidence: float | None
    flag_reason: str | None
    image_url: str | None


class AdminDashboardResponse(BaseModel):
    stats: AdminDashboardStats
    sponsor_queue: list[AdminProviderApp]
    provider_queue: list[AdminProviderApp]
    flagged_submissions: list[AdminFlaggedSubmission]
