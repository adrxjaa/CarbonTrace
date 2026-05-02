"""models/__init__.py

Import all models here so SQLAlchemy's metadata registry is complete before
`create_tables()` or Alembic autogenerate runs.
"""
from core.database import Base  # noqa: F401

from models.user import User  # noqa: F401
from models.submission import Submission  # noqa: F401
from models.credit import CarbonCredit  # noqa: F401
from models.notification import Notification  # noqa: F401
from models.provider_application import ProviderApplication  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Submission",
    "CarbonCredit",
    "Notification",
    "ProviderApplication",
]
