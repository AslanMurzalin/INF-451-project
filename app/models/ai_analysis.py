from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import SentimentLabel, AnalysisStatus


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    analysis_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.feedback_id", ondelete="CASCADE"), unique=True, nullable=False)
    sentiment_label = Column(Enum(SentimentLabel), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    summary_text = Column(Text, nullable=True)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False, index=True)
    processed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    feedback = relationship("Feedback", back_populates="analysis")
