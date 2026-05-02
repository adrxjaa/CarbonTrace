import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ProviderApplicationCreate(BaseModel):
    org_name: str = Field(..., min_length=2, max_length=300)
    provider_type: str = Field(
        ..., pattern=r"^(transit|ev|tree_nursery|recycling|other)$"
    )
    operating_region: str = Field(..., min_length=2, max_length=200)
    website: str | None = Field(default=None, max_length=500)
    contact_name: str = Field(..., min_length=2, max_length=200)
    contact_email: EmailStr
    contact_designation: str | None = Field(default=None, max_length=200)
    activity_description: str | None = Field(default=None, max_length=2000)
    expected_monthly_volume: str | None = Field(default=None, max_length=100)


class SponsorApplicationCreate(BaseModel):
    entity_name: str = Field(..., min_length=2, max_length=300)
    industry_sector: str = Field(..., min_length=2, max_length=100)
    tax_id: str | None = Field(default=None, max_length=50)
    corporate_website: str | None = Field(default=None, max_length=500)
    sustainability_goals: str | None = Field(default=None, max_length=3000)
    contact_email: EmailStr


class ProviderApplicationOut(BaseModel):
    id: uuid.UUID
    org_name: str
    provider_type: str
    operating_region: str
    website: str | None
    contact_name: str
    contact_email: str
    status: str
    created_at: datetime
    reviewed_at: datetime | None

    model_config = {"from_attributes": True}
