from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.enums import FeedbackSourceType, SentimentLabel


class TopicItem(BaseModel):
    topic_id: int
    name: str
    entry_count: int
    relevance_score: Optional[float] = None
    positive_count: int = 0
    neutral_count: int = 0
    negative_count: int = 0
    predominant_sentiment: Optional[str] = None

    model_config = {"from_attributes": True}


class TopicListResponse(BaseModel):
    total_topics: int
    total_entries_tagged: int
    items: List[TopicItem]


class TopicFeedbackItem(BaseModel):
    feedback_id: int
    raw_text: str
    rating: Optional[int] = None
    source_type: FeedbackSourceType
    submitted_at: datetime
    is_anonymous: bool = False
    relevance_score: float = 1.0
    sentiment_label: Optional[SentimentLabel] = None
    sentiment_score: Optional[float] = None
    target_name: Optional[str] = None

    model_config = {"from_attributes": True}


class TopicDetailResponse(BaseModel):
    topic_id: int
    name: str
    entry_count: int
    feedbacks: List[TopicFeedbackItem]

    model_config = {"from_attributes": True}
