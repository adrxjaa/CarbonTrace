import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.types import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class CarbonCredit(Base):
    __tablename__ = "carbon_credits"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True
    )

    # Credit amount in points
    credit_amount: Mapped[float] = mapped_column(Float, nullable=False)

    # CO2 equivalent in kg (calculated from activity type and metadata)
    co2_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Status: pending | confirmed | redeemed
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)

    # Blockchain reference
    tx_hash: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Cycle tracking (e.g., "2025-04" for April 2025)
    cycle: Mapped[str] = mapped_column(String(10), nullable=False, default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    submission = relationship("Submission", back_populates="credit", lazy="select")

    def __repr__(self) -> str:
        return f"<CarbonCredit id={self.id} amount={self.credit_amount} status={self.status}>"
