import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


ACTIVITY_TYPES = {"transit", "ev_charge", "tree_planting", "recycling", "other"}
SUBMISSION_STATUSES = {"PENDING", "VERIFIED", "FLAGGED", "REJECTED"}


class SubmissionCreate(BaseModel):
    activity_type: str = Field(..., pattern=r"^(transit|ev_charge|tree_planting|recycling|other)$")
    metadata_json: dict[str, Any] = Field(default_factory=dict)
    activity_timestamp: datetime
    location: str | None = Field(default=None, max_length=500)


class SubmissionOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    activity_type: str
    metadata_json: dict[str, Any]
    activity_timestamp: datetime
    location: str | None
    evidence_url: str | None
    evidence_filename: str | None
    status: str
    verification_confidence: float | None
    extracted_text: str | None
    flag_reason: str | None
    tx_hash: str | None
    on_chain: bool
    verified_at: datetime | None
    chain_committed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionFilter(BaseModel):
    status: str | None = Field(default=None)
    activity_type: str | None = Field(default=None)
    date_from: datetime | None = Field(default=None)
    date_to: datetime | None = Field(default=None)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class SubmissionListOut(BaseModel):
    items: list[SubmissionOut]
    total: int
    page: int
    page_size: int
    total_pages: int
