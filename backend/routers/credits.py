from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser
from schemas.credit import WalletSummary
from services.credit_service import get_wallet_summary

router = APIRouter(prefix="/credits", tags=["Carbon Credits"])


@router.get(
    "/wallet",
    response_model=WalletSummary,
    summary="Get wallet summary with credit breakdown and full history",
    description=(
        "Returns available (confirmed), pending, and redeemed credits, "
        "total CO₂ offset, and full credit transaction history."
    ),
)
async def wallet(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> WalletSummary:
    return await get_wallet_summary(db, current_user.id)
