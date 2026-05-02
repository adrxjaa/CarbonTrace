"""
CarbonTrace — Demo Data Seed Script
Run with: .\\venv\\Scripts\\python.exe scripts\\seed_demo.py
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random
import sys
import os

# Allow imports from the backend root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from core.config import settings
from models.user import User
from models.submission import Submission
from models.credit import CarbonCredit
from models.notification import Notification
from models.provider_application import ProviderApplication

# ── Config ─────────────────────────────────────────────────────────────────────
DB_URL = settings.database_url

# ── Helpers ────────────────────────────────────────────────────────────────────
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def now() -> datetime:
    return datetime.now(timezone.utc)

def days_ago(n: int) -> datetime:
    return now() - timedelta(days=n)

def rand_ts(max_days: int = 60) -> datetime:
    return now() - timedelta(days=random.uniform(0, max_days), hours=random.uniform(0, 12))

# ── Demo Users ─────────────────────────────────────────────────────────────────
DEMO_USERS = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "name": "Alex Green",
        "email": "demo@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "San Francisco, CA",
        "bio": "Passionate about sustainable living. Cycling everywhere since 2019.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
        "name": "Priya Sharma",
        "email": "priya@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Austin, TX",
        "bio": "EV driver and tree planting enthusiast.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "name": "Marco Rossi",
        "email": "marco@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Chicago, IL",
        "bio": "Public transit commuter. Zero waste advocate.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
        "name": "Yuki Tanaka",
        "email": "yuki@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Seattle, WA",
        "bio": "Recycling champion and composting pro.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000005"),
        "name": "Layla Hassan",
        "email": "layla@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Denver, CO",
        "bio": "Solar panels on the roof, bike in the garage.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000006"),
        "name": "James Okonkwo",
        "email": "james@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Miami, FL",
        "bio": "Coastal conservation volunteer.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000007"),
        "name": "Sofia Andersen",
        "email": "sofia@carbontrace.io",
        "password": "demo1234",
        "role": "citizen",
        "location": "Portland, OR",
        "bio": "Vegan chef & urban farmer.",
        "show_on_leaderboard": True,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000008"),
        "name": "Admin CarbonTrace",
        "email": "admin@carbontrace.io",
        "password": "admin123",
        "role": "admin",
        "location": "HQ",
        "bio": "Platform administrator.",
        "show_on_leaderboard": False,
    },
]

# ── Activity Templates ─────────────────────────────────────────────────────────
ACTIVITY_POOL = [
    {
        "activity_type": "transit",
        "metadata_json": {"route": "Downtown → Office", "mode": "subway", "distance_km": 12.4},
        "location": "Line 7, Civic Center Station",
        "co2_kg": 8.5,
        "credits": 18,
    },
    {
        "activity_type": "transit",
        "metadata_json": {"route": "Home → Airport", "mode": "bus", "distance_km": 22.1},
        "location": "Express Bus Route 44",
        "co2_kg": 14.2,
        "credits": 18,
    },
    {
        "activity_type": "ev_charge",
        "metadata_json": {"station": "Tesla Supercharger", "kwh": 45.2, "vehicle": "Model 3"},
        "location": "SF Supercharger Hub",
        "co2_kg": 32.1,
        "credits": 55,
    },
    {
        "activity_type": "ev_charge",
        "metadata_json": {"station": "ChargePoint", "kwh": 28.8, "vehicle": "Chevy Bolt"},
        "location": "Whole Foods Parking, Austin",
        "co2_kg": 20.4,
        "credits": 55,
    },
    {
        "activity_type": "tree_planting",
        "metadata_json": {"species": "Coast Live Oak", "saplings": 3, "plot": "Marin County"},
        "location": "Marin County Restoration Site",
        "co2_kg": 45.0,
        "credits": 30,
    },
    {
        "activity_type": "tree_planting",
        "metadata_json": {"species": "Douglas Fir", "saplings": 5, "plot": "Olympic NF"},
        "location": "Olympic National Forest",
        "co2_kg": 75.0,
        "credits": 30,
    },
    {
        "activity_type": "recycling",
        "metadata_json": {"material": "Electronics", "weight_kg": 8.5, "facility": "GreenDrop"},
        "location": "GreenDrop Recycling Center",
        "co2_kg": 6.2,
        "credits": 22,
    },
    {
        "activity_type": "recycling",
        "metadata_json": {"material": "Paper & Cardboard", "weight_kg": 22.3, "facility": "ReUse"},
        "location": "ReUse Municipal Facility",
        "co2_kg": 16.8,
        "credits": 22,
    },
    {
        "activity_type": "other",
        "metadata_json": {"description": "Composting 30 days food waste", "weight_kg": 12},
        "location": "Home Compost Bin",
        "co2_kg": 4.2,
        "credits": 15,
    },
]

# Per-user submission plans: (activity_idx, status, days_ago)
USER_PLANS = {
    "00000000-0000-0000-0000-000000000001": [  # Alex (demo user, primary)
        (2, "VERIFIED", 58), (0, "VERIFIED", 45), (4, "VERIFIED", 40),
        (6, "VERIFIED", 35), (1, "VERIFIED", 28), (3, "VERIFIED", 21),
        (5, "VERIFIED", 15), (7, "VERIFIED", 10), (8, "PENDING",  4),
        (0, "PENDING",  2),  (6, "FLAGGED",  1),
    ],
    "00000000-0000-0000-0000-000000000002": [  # Priya
        (3, "VERIFIED", 55), (5, "VERIFIED", 48), (2, "VERIFIED", 38),
        (7, "VERIFIED", 30), (4, "VERIFIED", 22), (0, "VERIFIED", 14),
        (1, "PENDING",  5),  (8, "PENDING",  2),
    ],
    "00000000-0000-0000-0000-000000000003": [  # Marco
        (0, "VERIFIED", 52), (1, "VERIFIED", 44), (6, "VERIFIED", 36),
        (8, "VERIFIED", 28), (0, "VERIFIED", 20), (7, "VERIFIED", 12),
        (1, "PENDING",  3),
    ],
    "00000000-0000-0000-0000-000000000004": [  # Yuki
        (6, "VERIFIED", 50), (7, "VERIFIED", 42), (8, "VERIFIED", 35),
        (6, "VERIFIED", 25), (4, "VERIFIED", 18), (7, "PENDING",  6),
    ],
    "00000000-0000-0000-0000-000000000005": [  # Layla
        (4, "VERIFIED", 60), (5, "VERIFIED", 45), (2, "VERIFIED", 30),
        (3, "VERIFIED", 20), (8, "PENDING",  8),
    ],
    "00000000-0000-0000-0000-000000000006": [  # James
        (2, "VERIFIED", 55), (0, "VERIFIED", 40), (6, "VERIFIED", 25),
        (1, "PENDING",  10), (7, "FLAGGED",  5),
    ],
    "00000000-0000-0000-0000-000000000007": [  # Sofia
        (8, "VERIFIED", 58), (4, "VERIFIED", 48), (6, "VERIFIED", 35),
        (0, "PENDING",  12),
    ],
}

NOTIFICATIONS_TEMPLATES = [
    {"type": "VERIFIED",      "title": "Activity Verified!",       "message": "Your EV charging session has been verified and 55 credits added to your wallet."},
    {"type": "CREDIT_ADDED",  "title": "Credits Added",            "message": "18 Carbon Credits added for your public transit commute on Line 7."},
    {"type": "FLAGGED",       "title": "Review Required",          "message": "Your recycling submission requires additional evidence. Please review the flag."},
    {"type": "SYSTEM",        "title": "Welcome to CarbonTrace!",  "message": "Your account is set up. Start logging eco-activities to earn Carbon Credits."},
    {"type": "VERIFIED",      "title": "Tree Planting Confirmed",  "message": "30 credits awarded for your 3 Coast Live Oak saplings planted at Marin County."},
    {"type": "CREDIT_ADDED",  "title": "Weekly Streak Bonus",      "message": "You've logged activities 7 days in a row! Bonus 10 CCT added to your wallet."},
]


async def seed():
    engine = create_async_engine(DB_URL, echo=False)
    Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        # ── Clear existing demo data ───────────────────────────────
        print("Clearing existing data...")
        demo_ids = [u["id"] for u in DEMO_USERS]
        await db.execute(delete(Notification).where(Notification.user_id.in_(demo_ids)))
        await db.execute(delete(CarbonCredit).where(CarbonCredit.user_id.in_(demo_ids)))
        await db.execute(delete(Submission).where(Submission.user_id.in_(demo_ids)))
        await db.execute(delete(User).where(User.id.in_(demo_ids)))
        await db.execute(delete(ProviderApplication))
        await db.commit()

        # ── Create users ───────────────────────────────────────────
        print("Creating demo users...")
        users: dict[str, User] = {}
        for ud in DEMO_USERS:
            user = User(
                id=ud["id"],
                name=ud["name"],
                email=ud["email"],
                hashed_password=hash_pw(ud["password"]),
                role=ud["role"],
                location=ud.get("location"),
                bio=ud.get("bio"),
                is_verified=True,
                is_active=True,
                show_on_leaderboard=ud.get("show_on_leaderboard", True),
                notify_verified=True,
                notify_flagged=True,
                notify_credit_added=True,
                created_at=days_ago(90),
                updated_at=days_ago(1),
            )
            db.add(user)
            users[str(ud["id"])] = user
        await db.commit()

        # ── Create submissions + credits ───────────────────────────
        print("Creating submissions and credits...")
        for user_id_str, plan in USER_PLANS.items():
            for act_idx, status, d_ago in plan:
                template = ACTIVITY_POOL[act_idx]
                sub_id = uuid.uuid4()
                ts = days_ago(d_ago)

                sub = Submission(
                    id=sub_id,
                    user_id=uuid.UUID(user_id_str),
                    activity_type=template["activity_type"],
                    metadata_json=template["metadata_json"],
                    activity_timestamp=ts,
                    location=template.get("location"),
                    status=status,
                    verification_confidence=round(random.uniform(0.82, 0.99), 2) if status == "VERIFIED" else
                                           round(random.uniform(0.55, 0.75), 2) if status == "FLAGGED" else None,
                    flag_reason="Evidence image quality too low. Please reupload a clearer photo." if status == "FLAGGED" else None,
                    verified_at=ts + timedelta(hours=random.uniform(1, 6)) if status == "VERIFIED" else None,
                    on_chain=status == "VERIFIED",
                    tx_hash=f"0x{uuid.uuid4().hex[:40]}" if status == "VERIFIED" else None,
                    chain_committed_at=ts + timedelta(hours=random.uniform(2, 8)) if status == "VERIFIED" else None,
                    created_at=ts,
                    updated_at=ts + timedelta(hours=1),
                )
                db.add(sub)

                # Add credit for verified submissions
                if status == "VERIFIED":
                    credit = CarbonCredit(
                        id=uuid.uuid4(),
                        user_id=uuid.UUID(user_id_str),
                        submission_id=sub_id,
                        credit_amount=float(template["credits"]),
                        co2_kg=float(template["co2_kg"]),
                        status="confirmed",
                        tx_hash=sub.tx_hash,
                        cycle=ts.strftime("%Y-%m"),
                        created_at=ts + timedelta(hours=2),
                        confirmed_at=ts + timedelta(hours=3),
                    )
                    db.add(credit)

        await db.commit()

        # ── Create notifications for demo user ────────────────────
        print("Creating notifications...")
        demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        for i, tmpl in enumerate(NOTIFICATIONS_TEMPLATES):
            notif = Notification(
                id=uuid.uuid4(),
                user_id=demo_user_id,
                notification_type=tmpl["type"],
                title=tmpl["title"],
                message=tmpl["message"],
                is_read=i > 2,  # first 3 unread
                created_at=days_ago(random.randint(1, 20)),
            )
            db.add(notif)
        await db.commit()

        # ── Create Provider and Sponsor Applications ──────────────
        print("Creating provider and sponsor applications...")
        
        provider_apps_data = [
            {
                "org_name": "Eco Transit Authority",
                "provider_type": "transit",
                "operating_region": "West Coast",
                "website": "https://ecotransit.example.com",
                "contact_name": "Sarah Jenkins",
                "contact_email": "s.jenkins@ecotransit.example.com",
                "contact_designation": "Sustainability Director",
                "activity_description": "We run a fleet of electric buses across 5 major cities.",
                "expected_monthly_volume": "5000 rides",
                "status": "APPROVED",
                "created_at": days_ago(40),
                "reviewed_at": days_ago(38),
            },
            {
                "org_name": "GreenCharge Networks",
                "provider_type": "ev",
                "operating_region": "National",
                "website": "https://greencharge.example.com",
                "contact_name": "Marcus Chen",
                "contact_email": "marcus@greencharge.example.com",
                "contact_designation": "Operations Manager",
                "activity_description": "Fast charging stations for EVs.",
                "expected_monthly_volume": "1200 charges",
                "status": "PENDING",
                "created_at": days_ago(2),
                "reviewed_at": None,
            },
            {
                "org_name": "Urban Canopy Project",
                "provider_type": "tree_nursery",
                "operating_region": "Pacific Northwest",
                "website": "https://urbancanopy.example.org",
                "contact_name": "Elena Rodriguez",
                "contact_email": "elena@urbancanopy.example.org",
                "contact_designation": "Founder",
                "activity_description": "Planting trees in urban areas to improve air quality.",
                "expected_monthly_volume": "500 trees",
                "status": "UNDER_REVIEW",
                "created_at": days_ago(5),
                "reviewed_at": None,
            },
            {
                "org_name": "RecycleRight",
                "provider_type": "recycling",
                "operating_region": "Northeast",
                "website": "https://recycleright.example.com",
                "contact_name": "David Smith",
                "contact_email": "d.smith@recycleright.example.com",
                "contact_designation": "CEO",
                "activity_description": "Electronics and plastic recycling.",
                "expected_monthly_volume": "10 tons",
                "status": "REJECTED",
                "created_at": days_ago(60),
                "reviewed_at": days_ago(58),
            }
        ]

        sponsor_apps_data = [
            {
                "org_name": "TechGlobal Solutions",
                "provider_type": "sponsor",
                "operating_region": "Technology / Software",
                "website": "https://techglobal.example.com",
                "contact_name": "TechGlobal Solutions", # Stored in contact_name for sponsor
                "contact_email": "csr@techglobal.example.com",
                "activity_description": "We aim to offset 100% of our server carbon emissions by 2030.", # Stored in activity_description for sponsor
                "expected_monthly_volume": "TX-987654321", # Stored in expected_monthly_volume for tax_id
                "status": "PENDING",
                "created_at": days_ago(3),
                "reviewed_at": None,
            },
            {
                "org_name": "Starlight Manufacturing",
                "provider_type": "sponsor",
                "operating_region": "Manufacturing",
                "website": "https://starlightmfg.example.com",
                "contact_name": "Starlight Manufacturing",
                "contact_email": "sustainability@starlightmfg.example.com",
                "activity_description": "Reducing factory footprint through verified offsets.",
                "expected_monthly_volume": "TX-123456789",
                "status": "APPROVED",
                "created_at": days_ago(25),
                "reviewed_at": days_ago(20),
            },
            {
                "org_name": "Nova Logistics",
                "provider_type": "sponsor",
                "operating_region": "Transportation / Logistics",
                "website": "https://novalogistics.example.com",
                "contact_name": "Nova Logistics",
                "contact_email": "green@novalogistics.example.com",
                "activity_description": "Offsetting fleet emissions while transitioning to EVs.",
                "expected_monthly_volume": "TX-555555555",
                "status": "UNDER_REVIEW",
                "created_at": days_ago(8),
                "reviewed_at": None,
            }
        ]

        for app_data in provider_apps_data + sponsor_apps_data:
            app = ProviderApplication(
                id=uuid.uuid4(),
                org_name=app_data["org_name"],
                provider_type=app_data["provider_type"],
                operating_region=app_data["operating_region"],
                website=app_data["website"],
                contact_name=app_data["contact_name"],
                contact_email=app_data["contact_email"],
                contact_designation=app_data.get("contact_designation"),
                activity_description=app_data.get("activity_description"),
                expected_monthly_volume=app_data.get("expected_monthly_volume"),
                status=app_data["status"],
                created_at=app_data["created_at"],
                reviewed_at=app_data["reviewed_at"],
            )
            db.add(app)
        await db.commit()

        print("\n=== Seed complete! ===")
        print("\nDemo login credentials:")
        print("  Email:    demo@carbontrace.io")
        print("  Password: demo1234")
        print("\nAdmin credentials:")
        print("  Email:    admin@carbontrace.io")
        print("  Password: admin123")
        print("\nOther demo users (all password: demo1234):")
        for u in DEMO_USERS[1:7]:
            print(f"  {u['email']}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
