from typing import Annotated, Any
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user_payload


# ── Typed aliases ─────────────────────────────────────────────────────────────

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentPayload = Annotated[dict[str, Any], Depends(get_current_user_payload)]


# ── User-fetching dependency ──────────────────────────────────────────────────

async def get_current_user(
    payload: CurrentPayload,
    db: DbSession,
) -> Any:
    from models.user import User  # local import avoids circular dependency

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    # Allow mock admins defined via environment variables
    role = payload.get("role")
    if role == "admin":
        from core.config import settings
        import uuid
        import hashlib
        from datetime import datetime, timezone
        
        if settings.admin_credentials:
            admins = [c.split(":") for c in settings.admin_credentials.split(",") if ":" in c]
            for admin_email, _ in admins:
                expected_id = str(uuid.UUID(hashlib.md5(admin_email.encode()).hexdigest()))
                if user_id == expected_id:
                    return User(
                        id=uuid.UUID(user_id),
                        name="System Admin",
                        email=admin_email,
                        hashed_password="",
                        role="admin",
                        is_active=True,
                        is_verified=True,
                        created_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc)
                    )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")
    return user


CurrentUser = Annotated[Any, Depends(get_current_user)]


async def get_current_citizen(current_user: CurrentUser) -> Any:
    if current_user.role not in ("citizen", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen access required",
        )
    return current_user


async def get_current_admin(current_user: CurrentUser) -> Any:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


CurrentCitizen = Annotated[Any, Depends(get_current_citizen)]
CurrentAdmin = Annotated[Any, Depends(get_current_admin)]


# ── Simple in-memory rate limiter for submission endpoint ─────────────────────

from collections import defaultdict
from datetime import datetime, timedelta, timezone
import threading

_submission_counts: dict[str, list[datetime]] = defaultdict(list)
_lock = threading.Lock()
WINDOW = timedelta(minutes=1)
MAX_PER_WINDOW = 10


def check_submission_rate_limit(request: Request) -> None:
    """Allow max 10 submissions per minute per user IP."""
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc)

    with _lock:
        timestamps = _submission_counts[client_ip]
        # Remove timestamps outside window
        timestamps[:] = [t for t in timestamps if now - t < WINDOW]
        if len(timestamps) >= MAX_PER_WINDOW:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many submissions. Max 10 per minute.",
            )
        timestamps.append(now)
