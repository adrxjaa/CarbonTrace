from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.deps import CurrentUser
from schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from services.auth_service import login_user, refresh_tokens, register_user, verify_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=dict,
    status_code=201,
    summary="Register a new user account",
    description="Creates a citizen, provider, or sponsor account. Returns JWT tokens. Sends a mock verification email to console.",
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    user, access_token, refresh_token = await register_user(db, data)
    return {
        "user": UserOut.model_validate(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "message": "Account created. Check console for email verification link.",
    }


@router.post(
    "/login",
    response_model=dict,
    summary="Authenticate with email and password",
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    user, access_token, refresh_token = await login_user(db, data)
    return {
        "user": UserOut.model_validate(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token using refresh token",
)
async def refresh(
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    access_token, new_refresh = await refresh_tokens(db, data.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.get(
    "/verify-email",
    summary="Verify email address from link",
)
async def verify_email_endpoint(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    user = await verify_email(db, token)
    return {"message": "Email verified successfully", "user_id": str(user.id)}


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user",
)
async def me(current_user: CurrentUser) -> UserOut:
    return UserOut.model_validate(current_user)
