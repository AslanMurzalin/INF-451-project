from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import EntityType


class TrendSnapshot(Base):
    __tablename__ = "trend_snapshots"

    snapshot_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(Enum(EntityType), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id", ondelete="SET NULL"), nullable=True)
    period = Column(String(50), nullable=False, index=True)  # e.g., "2026-Fall"
    avg_sentiment = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    topic = relationship("Topic", back_populates="trend_snapshots")
