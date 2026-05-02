import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Activity type: transit | ev_charge | tree_planting | recycling | other
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Flexible JSON metadata (route, kWh, saplings, material type, etc.)
    metadata_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # When the activity happened (user-reported)
    activity_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    location: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Uploaded evidence
    evidence_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    evidence_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Status: PENDING | VERIFIED | FLAGGED | REJECTED
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)

    # AI Verification outputs
    verification_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    flag_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Blockchain simulation
    tx_hash: Mapped[str | None] = mapped_column(String(100), nullable=True)
    on_chain: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chain_committed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates=None, lazy="select")
    credit = relationship("CarbonCredit", back_populates="submission", uselist=False, lazy="select")

    def __repr__(self) -> str:
        return f"<Submission id={self.id} type={self.activity_type} status={self.status}>"
