"""
CarbonTrace — FastAPI Application Entry Point
Stage 1 MVP: Citizen User System (B2C)
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.database import create_tables
from routers.auth import router as auth_router
from routers.credits import router as credits_router
from routers.dashboard import router as dashboard_router
from routers.leaderboard import router as leaderboard_router
from routers.notifications import router as notifications_router
from routers.providers import router as providers_router
from routers.submissions import router as submissions_router
from routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Create upload directory
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    # Create DB tables (dev mode — use Alembic in production)
    await create_tables()
    print(f"\n✅ CarbonTrace API ready — {settings.app_env.upper()} mode")
    print(f"   Docs: http://localhost:8000/docs\n")
    yield
    # Shutdown (nothing to clean up for now)


app = FastAPI(
    title="CarbonTrace API",
    description=(
        "Blockchain-backed, AI-verified eco-activity tracking platform. "
        "Stage 1 MVP — Citizen User System (B2C)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving for uploaded evidence ─────────────────────────────────
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(submissions_router)
app.include_router(credits_router)
app.include_router(notifications_router)
app.include_router(providers_router)
app.include_router(leaderboard_router)
app.include_router(users_router)


import uvicorn


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
async def health() -> dict:
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": "1.0.0",
        "env": settings.app_env,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
