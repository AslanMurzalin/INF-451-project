from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Topic(Base):
    __tablename__ = "topics"

    topic_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    # Relationships
    feedback_topics = relationship("FeedbackTopic", back_populates="topic", cascade="all, delete-orphan")
    trend_snapshots = relationship("TrendSnapshot", back_populates="topic")


class FeedbackTopic(Base):
    __tablename__ = "feedback_topics"

    feedback_id = Column(Integer, ForeignKey("feedbacks.feedback_id", ondelete="CASCADE"), primary_key=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id", ondelete="CASCADE"), primary_key=True)
    relevance_score = Column(Float, nullable=False, default=1.0)

    # Relationships
    feedback = relationship("Feedback", back_populates="feedback_topics")
    topic = relationship("Topic", back_populates="feedback_topics")
