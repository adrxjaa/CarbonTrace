import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Roles: citizen | provider | sponsor | admin
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="citizen", index=True)

    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    wallet_address: Mapped[str | None] = mapped_column(String(100), nullable=True)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Email verification token (stored hashed, cleared after use)
    verification_token: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Notification preferences (stored as comma-separated flags for simplicity)
    notify_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_flagged: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_credit_added: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_weekly_digest: Mapped[bool] = mapped_column(Boolean, default=False)

    # Privacy
    show_on_leaderboard: Mapped[bool] = mapped_column(Boolean, default=True)
    anonymize_leaderboard: Mapped[bool] = mapped_column(Boolean, default=False)

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
