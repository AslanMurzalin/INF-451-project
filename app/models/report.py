from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import ReportType


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    generated_by = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    report_type = Column(Enum(ReportType), nullable=False)
    file_path = Column(String(500), nullable=False)
    filters_json = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    author = relationship("User", back_populates="reports")
