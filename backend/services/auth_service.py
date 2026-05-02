import secrets
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import create_access_token, create_refresh_token, hash_password, verify_password
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest


async def register_user(db: AsyncSession, data: RegisterRequest) -> tuple[User, str, str]:
    """Create a new user account. Returns (user, access_token, refresh_token)."""
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Generate email verification token
    verification_token = secrets.token_urlsafe(32)

    user = User(
        id=uuid.uuid4(),
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        location=data.location,
        wallet_address=data.wallet_address,
        is_verified=False,
        verification_token=verification_token,
    )
    db.add(user)
    await db.flush()   # assigns PK without committing

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))

    # Mock email send — in production swap this for a real SMTP call
    _mock_send_verification_email(user.email, verification_token)

    return user, access_token, refresh_token


async def login_user(db: AsyncSession, data: LoginRequest) -> tuple[User, str, str]:
    """Authenticate and return tokens. Returns (user, access_token, refresh_token)."""
    
    # 1. Check environment variable admins
    from core.config import settings
    if settings.admin_credentials:
        admins = [c.split(":") for c in settings.admin_credentials.split(",") if ":" in c]
        for admin_email, admin_pass in admins:
            if data.email == admin_email.strip() and data.password == admin_pass.strip():
                # Generate a deterministic mock UUID for this admin based on their email
                import hashlib
                from datetime import datetime, timezone
                mock_id = uuid.UUID(hashlib.md5(admin_email.encode()).hexdigest())
                
                admin_user = User(
                    id=mock_id,
                    name="System Admin",
                    email=admin_email,
                    hashed_password="",
                    role="admin",
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                access_token = create_access_token(str(admin_user.id), admin_user.role)
                refresh_token = create_refresh_token(str(admin_user.id))
                return admin_user, access_token, refresh_token

    # 2. Regular database login
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended",
        )

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))
    return user, access_token, refresh_token


async def verify_email(db: AsyncSession, token: str) -> User:
    """Mark user as verified given a valid token."""
    result = await db.execute(
        select(User).where(User.verification_token == token)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired verification token",
        )

    user.is_verified = True
    user.verification_token = None
    await db.flush()
    return user


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
    """Validate refresh token and issue new pair."""
    from core.security import decode_token

    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a refresh token",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    new_access = create_access_token(str(user.id), user.role)
    new_refresh = create_refresh_token(str(user.id))
    return new_access, new_refresh


def _mock_send_verification_email(email: str, token: str) -> None:
    """Prints verification link to console. Replace with real SMTP in production."""
    link = f"http://localhost:8000/auth/verify-email?token={token}"
    print(f"\n{'='*60}")
    print(f"  📧  EMAIL VERIFICATION (MOCK)")
    print(f"  To: {email}")
    print(f"  Link: {link}")
    print(f"{'='*60}\n")
