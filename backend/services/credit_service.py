import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.credit import CarbonCredit
from models.submission import Submission
from schemas.credit import WalletSummary

# Credits per activity type (matches verification_service.py CREDIT_MAP)
CREDIT_MAP = {
    "transit": 18.0,
    "ev_charge": 55.0,
    "tree_planting": 30.0,
    "recycling": 22.0,
    "other": 15.0,
}

# CO₂ kg equivalent per activity type
CO2_MAP = {
    "transit": 3.2,
    "ev_charge": 12.5,
    "tree_planting": 8.0,
    "recycling": 5.5,
    "other": 2.0,
}


async def assign_credits(
    db: AsyncSession,
    submission: Submission,
) -> CarbonCredit:
    """
    Create a confirmed CarbonCredit record for a verified submission.
    Called automatically by verification_service after VERIFIED outcome.
    """
    credit_amount = CREDIT_MAP.get(submission.activity_type, 15.0)
    co2_kg = CO2_MAP.get(submission.activity_type, 2.0)

    # Generate the credit cycle string (e.g., "2025-04")
    now = datetime.now(timezone.utc)
    cycle = now.strftime("%Y-%m")

    credit = CarbonCredit(
        id=uuid.uuid4(),
        user_id=submission.user_id,
        submission_id=submission.id,
        credit_amount=credit_amount,
        co2_kg=co2_kg,
        status="confirmed",
        tx_hash=submission.tx_hash,
        cycle=cycle,
        confirmed_at=now,
    )
    db.add(credit)
    await db.flush()

    print(
        f"[CreditService] Assigned {credit_amount} credits "
        f"({co2_kg} kg CO₂) to user {submission.user_id}"
    )
    return credit


async def get_wallet_summary(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> WalletSummary:
    """Return a full wallet summary for the given user."""
    result = await db.execute(
        select(CarbonCredit)
        .where(CarbonCredit.user_id == user_id)
        .order_by(CarbonCredit.created_at.desc())
    )
    credits = result.scalars().all()

    confirmed = sum(c.credit_amount for c in credits if c.status == "confirmed")
    pending = sum(c.credit_amount for c in credits if c.status == "pending")
    redeemed = sum(c.credit_amount for c in credits if c.status == "redeemed")
    total_co2 = sum(c.co2_kg for c in credits if c.status == "confirmed")

    from schemas.credit import CreditOut
    return WalletSummary(
        total_credits=confirmed + pending,
        available_credits=confirmed,
        pending_credits=pending,
        redeemed_credits=redeemed,
        total_co2_kg=round(total_co2, 2),
        credit_history=[CreditOut.model_validate(c) for c in credits],
    )
