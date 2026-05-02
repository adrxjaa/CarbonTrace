from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from core.config import settings

is_sqlite = settings.database_url.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {}
engine_kwargs = {
    "echo": settings.debug,
    "pool_pre_ping": True,
}
if not is_sqlite:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(
    settings.database_url,
    connect_args=connect_args,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy models."""
    pass


async def get_db() -> AsyncSession:  # type: ignore[return]
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables() -> None:
    """Create all tables on startup (dev only). Use Alembic in production."""
    async with engine.begin() as conn:
        from models import Base as ModelsBase  # noqa: F401 — registers all models
        await conn.run_sync(ModelsBase.metadata.create_all)
