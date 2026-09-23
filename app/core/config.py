from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Enhanced Student Feedback Analysis System"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT encoding & decoding
    SECRET_KEY: str = "super-secret-dev-key-change-in-production-1234567890!@#"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7          # 7 days for refresh token
    
    # Cookie Configuration (Secure, SameSite=Lax for access token)
    COOKIE_SECURE: bool = False  # Set to True in production (HTTPS)
    COOKIE_SAMESITE: str = "lax"
    
    # Secret for registering new Admin users
    ADMIN_REGISTRATION_SECRET: str = "admin-secret-dev-key"
    
    # Database (SQLite by default, or Cloud PostgreSQL e.g. Neon, Supabase, Render)
    DATABASE_URL: str = "sqlite:///./feedback_system.db"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        # Cloud providers like Neon/Supabase/Heroku often provide postgres://
        # SQLAlchemy 2.0 requires postgresql://
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # Redis URL (for future distributed caching and rate limiting)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # SlowAPI Rate Limiting Defaults
    DEFAULT_RATE_LIMIT: str = "100/minute"
    AUTH_RATE_LIMIT: str = "10/minute"

    # CORS - Local development frontend origins (Required for credentials/cookies to work)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
