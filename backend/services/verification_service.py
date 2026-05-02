"""
AI Verification Pipeline — Simulated for MVP.

In Stage 2, replace `_simulate_ai_result()` with a real ML model call.
Everything else (status update, notification, credit assignment, blockchain commit)
remains unchanged.
"""
import random
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.submission import Submission


# ── Credit amounts per activity type ─────────────────────────────────────────
CREDIT_MAP = {
    "transit": 18,
    "ev_charge": 55,
    "tree_planting": 30,
    "recycling": 22,
    "other": 15,
}

# ── CO₂ kg equivalent per activity type ──────────────────────────────────────
CO2_MAP = {
    "transit": 3.2,
    "ev_charge": 12.5,
    "tree_planting": 8.0,
    "recycling": 5.5,
    "other": 2.0,
}

# ── Mock OCR extracted text by activity type ──────────────────────────────────
MOCK_OCR = {
    "transit": "METRO RAIL RECEIPT | Route: KR Puram → MG Road | Date: {date} | Amount: ₹25",
    "ev_charge": "EV CHARGE LOG | Station ID: CHR-4892 | Energy: 42.3 kWh | Duration: 1h 22m | Date: {date}",
    "tree_planting": "PLANTING CERTIFICATE | Saplings: 3 | Species: Neem, Peepal, Banyan | Location verified | Date: {date}",
    "recycling": "RECYCLING DROP | Material: PET Plastic | Weight: 4.8 kg | Facility: GreenHub Koramangala | Date: {date}",
    "other": "ACTIVITY PROOF | Verified sustainable action | Date: {date}",
}


def _simulate_ai_result() -> tuple[str, float]:
    """
    Simulate AI verification outcome.
    Returns (status, confidence) with distribution: 80% VERIFIED, 15% FLAGGED, 5% REJECTED.
    """
    roll = random.random()
    if roll < 0.80:
        confidence = round(random.uniform(78.0, 99.0), 1)
        return "VERIFIED", confidence
    elif roll < 0.95:
        confidence = round(random.uniform(35.0, 65.0), 1)
        return "FLAGGED", confidence
    else:
        confidence = round(random.uniform(5.0, 30.0), 1)
        return "REJECTED", confidence


async def run_ai_verification(
    submission_id: uuid.UUID,
) -> None:
    """
    Background task: simulate AI verification and trigger downstream effects.
    Called immediately after submission creation via FastAPI BackgroundTasks.
    """
    from core.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        # Re-fetch submission in this background context
        result = await db.execute(select(Submission).where(Submission.id == submission_id))
        submission = result.scalar_one_or_none()
        if not submission:
            return  # submission deleted between creation and task execution

    # ── Simulate AI ───────────────────────────────────────────────────────────
    new_status, confidence = _simulate_ai_result()
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")

    submission.verification_confidence = confidence
    submission.extracted_text = MOCK_OCR.get(submission.activity_type, MOCK_OCR["other"]).format(date=date_str)
    submission.status = new_status
    submission.verified_at = now

    if new_status == "FLAGGED":
        submission.flag_reason = (
            "Confidence score below threshold. Evidence may be blurry, "
            "tampered, or not within the valid time window."
        )

    await db.flush()

    # ── Trigger downstream effects ────────────────────────────────────────────
    if new_status == "VERIFIED":
        from services.blockchain_service import simulate_on_chain_commit
        from services.credit_service import assign_credits
        from services.notification_service import create_notification

        await simulate_on_chain_commit(db, submission)
        credit = await assign_credits(db, submission)

        await create_notification(
            db,
            user_id=submission.user_id,
            notification_type="VERIFIED",
            title="Activity Verified ✓",
            message=(
                f"Your {submission.activity_type.replace('_', ' ').title()} submission "
                f"was verified with {confidence}% confidence. "
                f"+{credit.credit_amount:.0f} credits added."
            ),
            submission_id=submission.id,
        )
        await create_notification(
            db,
            user_id=submission.user_id,
            notification_type="CREDIT_ADDED",
            title="Credits Added 🌿",
            message=f"+{credit.credit_amount:.0f} carbon credits added to your wallet.",
            submission_id=submission.id,
        )

    elif new_status == "FLAGGED":
        from services.notification_service import create_notification

        await create_notification(
            db,
            user_id=submission.user_id,
            notification_type="FLAGGED",
            title="Submission Flagged ⚠️",
            message=(
                f"Your {submission.activity_type.replace('_', ' ').title()} submission "
                f"was flagged for review. Please check the evidence and resubmit if needed."
            ),
            submission_id=submission.id,
        )

    await db.commit()
    print(f"[VerificationService] Submission {submission_id} → {new_status} ({confidence}%)")
