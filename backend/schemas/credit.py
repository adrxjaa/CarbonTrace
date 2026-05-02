import uuid
from datetime import datetime

from pydantic import BaseModel


class CreditOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    submission_id: uuid.UUID | None
    credit_amount: float
    co2_kg: float
    status: str
    tx_hash: str | None
    cycle: str
    created_at: datetime
    confirmed_at: datetime | None

    model_config = {"from_attributes": True}


class WalletSummary(BaseModel):
    total_credits: float
    available_credits: float     # confirmed
    pending_credits: float       # pending
    redeemed_credits: float      # redeemed
    total_co2_kg: float
    credit_history: list[CreditOut]
