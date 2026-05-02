"""
CarbonTrace — Database Seed Script
Creates test users, submissions, credits, and notifications for development.

Usage (from backend/ directory):
    python scripts/seed.py
"""
import asyncio
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import AsyncSessionLocal, create_tables
from core.security import hash_password
from models.credit import CarbonCredit
from models.notification import Notification
from models.provider_application import ProviderApplication
from models.submission import Submission
from models.user import User


async def seed(db: AsyncSession) -> None:
    print("🌱 Seeding CarbonTrace database...")

    # ── Test Users ────────────────────────────────────────────────────────────
    users_data = [
        {
            "name": "Aarav Mehta",
            "email": "aarav@example.com",
            "password": "Password123",
            "role": "citizen",
            "location": "Bangalore, KA",
            "is_verified": True,
        },
        {
            "name": "Priya Nair",
            "email": "priya@example.com",
            "password": "Password123",
            "role": "citizen",
            "location": "Kochi, KL",
            "is_verified": True,
        },
        {
            "name": "Admin User",
            "email": "admin@carbontrace.io",
            "password": "Admin123!",
            "role": "admin",
            "location": "Mumbai, MH",
            "is_verified": True,
        },
    ]

    created_users: list[User] = []
    for ud in users_data:
        result = await db.execute(select(User).where(User.email == ud["email"]))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"  ⏭  User {ud['email']} already exists — skipping")
            created_users.append(existing)
            continue

        user = User(
            id=uuid.uuid4(),
            name=ud["name"],
            email=ud["email"],
            hashed_password=hash_password(ud["password"]),
            role=ud["role"],
            location=ud.get("location"),
            is_verified=ud.get("is_verified", False),
        )
        db.add(user)
        created_users.append(user)
        print(f"  ✅ Created user: {ud['email']} ({ud['role']})")

    await db.flush()

    # ── Submissions for Aarav ─────────────────────────────────────────────────
    citizen = created_users[0]
    now = datetime.now(timezone.utc)

    submissions_data = [
        {
            "activity_type": "ev_charge",
            "metadata_json": {"kwh": 42.0, "station_id": "CHR-4892"},
            "status": "VERIFIED",
            "confidence": 94.2,
            "credits": 55.0,
            "co2_kg": 12.5,
            "days_ago": 1,
            "evidence_url": None,
        },
        {
            "activity_type": "transit",
            "metadata_json": {"route": "KR Puram → MG Road", "operator": "BMTC"},
            "status": "PENDING",
            "confidence": None,
            "credits": None,
            "co2_kg": None,
            "days_ago": 0,
            "evidence_url": None,
        },
        {
            "activity_type": "tree_planting",
            "metadata_json": {"saplings": 3, "species": "Neem"},
            "status": "VERIFIED",
            "confidence": 88.7,
            "credits": 30.0,
            "co2_kg": 8.0,
            "days_ago": 12,
            "evidence_url": None,
        },
        {
            "activity_type": "transit",
            "metadata_json": {"route": "Silk Board → Electronic City", "operator": "Metro"},
            "status": "FLAGGED",
            "confidence": 42.0,
            "credits": None,
            "co2_kg": None,
            "days_ago": 0,
            "evidence_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCLjW8ihzYTIjfjSpZiqxnErvBVdIttpdDvHl4vr7J9pprEsxHFPXLmV_d7L5yjk34-t3fOW3ubNaT0GOgjwHUBTizSoPLR90LJvd81Cxh3ZZ2u-OnjMVvJcC3-245bQGMLLJflOB_Mk1nuajb2vsOmIQmcYtnog4vVSXPNKeENL9CG9srApXJH9e0vc7iegmuJveLIeFqSMIa-efhA6sdQDZxOTTjPm1no-UX3Duftt578bEUuR-vfNeYxp37bWAxoYP3klOZUqg",
            "flag_reason": "Low OCR confidence",
        },
        {
            "activity_type": "bike_commute",
            "metadata_json": {"distance_km": 12.5, "route": "Indiranagar to Koramangala"},
            "status": "FLAGGED",
            "confidence": 18.5,
            "credits": None,
            "co2_kg": None,
            "days_ago": 0,
            "evidence_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBdhi6WK1za_Cw1XoU9MgXRKQi5X1ObUV2ZWGMjmLtLS0POn20P7a0kzaJBNM_BPS5OvK3Bs5OXUqRlgkv3yVhWbC3u1AY4KHT-Jpgc7D1VKeBLF9DIX8yvP4ucupKi5ICBZ_LpGdZPCeIpYFFLtXsOKVFgiFG1X2d1zr0C7YSa27PPr0Ekb2BA-zKi_lUSX43DmE_xOEMwhPJ5EU9LJtv_A3q7k6ez8aLXXl56PvggFhKBwNFKecx13xpBXXeO7PidzbQJkCnwTQ",
            "flag_reason": "Location mismatch",
        },
        {
            "activity_type": "energy_bill",
            "metadata_json": {"kwh_saved": 150, "month": "March"},
            "status": "FLAGGED",
            "confidence": 99.9,
            "credits": None,
            "co2_kg": None,
            "days_ago": 1,
            "evidence_url": None,
            "flag_reason": "Duplicate submission",
        },
        {
            "activity_type": "recycling",
            "metadata_json": {"material": "PET Plastic", "weight_kg": 4.8},
            "status": "VERIFIED",
            "confidence": 96.1,
            "credits": 22.0,
            "co2_kg": 5.5,
            "days_ago": 5,
            "evidence_url": None,
        },
    ]

    import hashlib

    for sd in submissions_data:
        sub_id = uuid.uuid4()
        ts = now - timedelta(days=sd["days_ago"])
        tx_hash = None
        on_chain = False

        if sd["status"] == "VERIFIED":
            raw = f"carbontrace:{sub_id}:{uuid.uuid4()}"
            tx_hash = f"0x{hashlib.sha256(raw.encode()).hexdigest()}"
            on_chain = True

        submission = Submission(
            id=sub_id,
            user_id=citizen.id,
            activity_type=sd["activity_type"],
            metadata_json=sd["metadata_json"],
            activity_timestamp=ts,
            location=citizen.location,
            status=sd["status"],
            verification_confidence=sd["confidence"],
            extracted_text=f"Mock OCR for {sd['activity_type']}" if sd["status"] != "PENDING" else None,
            flag_reason=sd.get("flag_reason") if sd["status"] == "FLAGGED" else None,
            tx_hash=tx_hash,
            on_chain=on_chain,
            verified_at=ts if sd["status"] != "PENDING" else None,
            chain_committed_at=ts if on_chain else None,
            evidence_url=sd.get("evidence_url"),
        )
        db.add(submission)
        await db.flush()

        if sd["status"] == "VERIFIED" and sd["credits"]:
            credit = CarbonCredit(
                id=uuid.uuid4(),
                user_id=citizen.id,
                submission_id=sub_id,
                credit_amount=sd["credits"],
                co2_kg=sd["co2_kg"],
                status="confirmed",
                tx_hash=tx_hash,
                cycle=ts.strftime("%Y-%m"),
                confirmed_at=ts,
            )
            db.add(credit)

            notif = Notification(
                id=uuid.uuid4(),
                user_id=citizen.id,
                notification_type="VERIFIED",
                title="Activity Verified ✓",
                message=f"Your {sd['activity_type'].replace('_', ' ').title()} was verified. +{sd['credits']:.0f} credits added.",
                submission_id=sub_id,
                is_read=False,
            )
            db.add(notif)

    print(f"  ✅ Created {len(submissions_data)} submissions for {citizen.name}")

    # ── Provider Applications ─────────────────────────────────────────────────
    provider_apps_data = [
        {
            "org_name": "EcoTransit Corp",
            "provider_type": "transit",
            "operating_region": "South India",
            "website": "https://ecotransit.in",
            "contact_name": "Ramesh Iyer",
            "contact_email": "ops@ecotransit.in",
            "contact_designation": "CTO",
            "activity_description": "Public bus and metro transit activity reporting",
            "expected_monthly_volume": "50000",
            "status": "PENDING",
        },
        {
            "org_name": "VoltCharge Hubs",
            "provider_type": "ev_charging",
            "operating_region": "National",
            "website": "https://voltcharge.com",
            "contact_name": "Anita Desai",
            "contact_email": "hello@voltcharge.com",
            "contact_designation": "Operations Head",
            "activity_description": "EV charging station data integration",
            "expected_monthly_volume": "120000",
            "status": "UNDER_REVIEW",
        },
        {
            "org_name": "GreenGrid Solar",
            "provider_type": "renewable_energy",
            "operating_region": "West India",
            "website": "https://greengrid.in",
            "contact_name": "Vikram Singh",
            "contact_email": "partners@greengrid.in",
            "contact_designation": "Director",
            "activity_description": "Residential solar panel installations",
            "expected_monthly_volume": "8000",
            "status": "APPROVED",
        },
        # Sponsor Applications
        {
            "org_name": "Global EcoCorp",
            "provider_type": "sponsor",
            "operating_region": "Technology",
            "website": "https://globaleco.com",
            "contact_name": "Sarah Jenkins",
            "contact_email": "csr@globaleco.com",
            "contact_designation": "VP Sustainability",
            "activity_description": "Offsetting corporate travel emissions",
            "expected_monthly_volume": "TAX-1044",
            "status": "PENDING",
        },
        {
            "org_name": "GreenTech Solutions",
            "provider_type": "sponsor",
            "operating_region": "Manufacturing",
            "website": "https://greentech.io",
            "contact_name": "Michael Chen",
            "contact_email": "sustainability@greentech.io",
            "contact_designation": "ESG Director",
            "activity_description": "Carbon neutral supply chain initiative",
            "expected_monthly_volume": "TAX-1042",
            "status": "UNDER_REVIEW",
        },
    ]

    for app_data in provider_apps_data:
        result = await db.execute(
            select(ProviderApplication).where(
                ProviderApplication.contact_email == app_data["contact_email"]
            )
        )
        if not result.scalar_one_or_none():
            provider_app = ProviderApplication(
                id=uuid.uuid4(),
                org_name=app_data["org_name"],
                provider_type=app_data["provider_type"],
                operating_region=app_data["operating_region"],
                website=app_data["website"],
                contact_name=app_data["contact_name"],
                contact_email=app_data["contact_email"],
                contact_designation=app_data["contact_designation"],
                activity_description=app_data["activity_description"],
                expected_monthly_volume=app_data["expected_monthly_volume"],
                status=app_data["status"],
            )
            db.add(provider_app)
            print(f"  ✅ Created application: {app_data['org_name']} ({app_data['provider_type']})")

    await db.commit()
    print("\n✅ Seed complete!")
    print("\n📋 Test credentials:")
    print("   Citizen 1: aarav@example.com / Password123")
    print("   Citizen 2: priya@example.com / Password123")
    print("   Admin:     admin@carbontrace.io / Admin123!")


async def main() -> None:
    await create_tables()
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(main())
