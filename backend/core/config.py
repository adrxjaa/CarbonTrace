from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────────────────────────────
    app_name: str = "CarbonTrace"
    app_env: str = "development"
    debug: bool = True
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://carbontrace:carbontrace@localhost:5432/carbontrace"
    )
    sync_database_url: str = (
        "postgresql://carbontrace:carbontrace@localhost:5432/carbontrace"
    )

    # ── JWT ───────────────────────────────────────────────────────────────────
    secret_key: str = "insecure-dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ── Storage ───────────────────────────────────────────────────────────────
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10

    # ── Email ─────────────────────────────────────────────────────────────────
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from: str = "noreply@carbontrace.io"
    email_verification_enabled: bool = False

    # ── Admin Auth ────────────────────────────────────────────────────────────
    admin_credentials: str = ""

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    submission_rate_limit: str = "10/minute"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
