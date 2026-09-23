from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import FeedbackSourceType


class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    source_type = Column(Enum(FeedbackSourceType), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.course_id", ondelete="SET NULL"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="SET NULL"), nullable=True)
    survey_id = Column(Integer, ForeignKey("surveys.survey_id", ondelete="SET NULL"), nullable=True)
    raw_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)  # 1 - 5
    is_anonymous = Column(Boolean, default=False, nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    course = relationship("Course", back_populates="feedbacks")
    service = relationship("Service", back_populates="feedbacks")
    survey = relationship("Survey", back_populates="feedbacks")
    analysis = relationship("AIAnalysis", back_populates="feedback", uselist=False, cascade="all, delete-orphan")
    feedback_topics = relationship("FeedbackTopic", back_populates="feedback", cascade="all, delete-orphan")
