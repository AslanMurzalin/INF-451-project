from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine configuration for both SQLite (local dev) and PostgreSQL (Docker / Free Cloud: Neon, Supabase, etc.)
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    # PostgreSQL / Cloud Database settings with pre-ping and connection recycling
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,      # Automatically reconnects if connection was closed by cloud provider
        pool_recycle=300,       # Recycles connections every 5 minutes
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
