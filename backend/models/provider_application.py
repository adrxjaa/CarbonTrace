import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class ProviderApplication(Base):
    __tablename__ = "provider_applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Organization details
    org_name: Mapped[str] = mapped_column(String(300), nullable=False)
    provider_type: Mapped[str] = mapped_column(String(50), nullable=False)  # transit|ev|tree_nursery|recycling|other
    operating_region: Mapped[str] = mapped_column(String(200), nullable=False)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Contact person
    contact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    contact_designation: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Business registration document URL
    doc_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    doc_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Description of activities + expected volume
    activity_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_monthly_volume: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status: PENDING | UNDER_REVIEW | APPROVED | REJECTED
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)

    # Admin processing
    reviewed_by: Mapped[str | None] = mapped_column(String(320), nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # API key (only set after approval, stored hashed)
    api_key_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<ProviderApplication id={self.id} org={self.org_name} status={self.status}>"
