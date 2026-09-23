from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import EntityType


class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(Enum(EntityType), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    trigger_reason = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    admin = relationship("User", back_populates="alerts")
