from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.credit import CarbonCredit
from models.submission import Submission

router = APIRouter(prefix="/users", tags=["Users"])

class UserUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    wallet_address: Optional[str] = None
    notify_verified: Optional[bool] = None
    notify_flagged: Optional[bool] = None
    show_on_leaderboard: Optional[bool] = None
    anonymize_leaderboard: Optional[bool] = None

class GamificationStats(BaseModel):
    xp: int
    rank: str
    streak_days: int

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    location: Optional[str]
    wallet_address: Optional[str]
    notify_verified: bool
    notify_flagged: bool
    show_on_leaderboard: bool
    anonymize_leaderboard: bool
    stats: GamificationStats

def calculate_rank(xp: int) -> str:
    if xp >= 5000:
        return "Forest"
    elif xp >= 3000:
        return "Tree"
    elif xp >= 1000:
        return "Sapling"
    else:
        return "Seedling"

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Calculate XP (from total credits)
    xp_res = await db.execute(
        select(func.coalesce(func.sum(CarbonCredit.credit_amount), 0.0))
        .where(CarbonCredit.user_id == current_user.id)
        .where(CarbonCredit.status == "confirmed")
    )
    total_xp = int(xp_res.scalar() or 0)
    
    # 2. Calculate Streak
    # Get all distinct dates (YYYY-MM-DD) of user's submissions
    dates_res = await db.execute(
        select(func.date(Submission.activity_timestamp))
        .where(Submission.user_id == current_user.id)
        .group_by(func.date(Submission.activity_timestamp))
        .order_by(desc(func.date(Submission.activity_timestamp)))
    )
    submission_dates = [d[0] for d in dates_res.all()]
    
    streak = 0
    if submission_dates:
        today = datetime.now(timezone.utc).date()
        current_date = today
        
        # If they haven't submitted today, check if they submitted yesterday to keep streak alive
        if submission_dates[0] == today:
            streak = 1
            idx = 1
        elif submission_dates[0] == today - timedelta(days=1):
            streak = 1
            current_date = today - timedelta(days=1)
            idx = 1
        else:
            idx = 0 # Streak is 0
            
        if streak > 0:
            for d in submission_dates[idx:]:
                if d == current_date - timedelta(days=1):
                    streak += 1
                    current_date = d
                else:
                    break

    return UserProfileResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        location=current_user.location,
        wallet_address=current_user.wallet_address,
        notify_verified=current_user.notify_verified,
        notify_flagged=current_user.notify_flagged,
        show_on_leaderboard=current_user.show_on_leaderboard,
        anonymize_leaderboard=current_user.anonymize_leaderboard,
        stats=GamificationStats(
            xp=total_xp,
            rank=calculate_rank(total_xp),
            streak_days=streak
        )
    )

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return await get_my_profile(current_user=current_user, db=db)
