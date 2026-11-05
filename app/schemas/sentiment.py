from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import FeedbackSourceType, SentimentLabel, AnalysisStatus


class AIAnalysisResponse(BaseModel):
    analysis_id: Optional[int] = None
    feedback_id: int
    sentiment_label: Optional[SentimentLabel] = None
    sentiment_score: Optional[float] = None
    status: AnalysisStatus = AnalysisStatus.PENDING
    summary_text: Optional[str] = None
    processed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FeedbackCreate(BaseModel):
    source_type: FeedbackSourceType
    course_id: Optional[int] = None
    service_id: Optional[int] = None
    survey_id: Optional[int] = None
    raw_text: str = Field(..., min_length=1)
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_anonymous: bool = False


class FeedbackResponse(BaseModel):
    feedback_id: int
    user_id: Optional[int] = None
    source_type: FeedbackSourceType
    course_id: Optional[int] = None
    service_id: Optional[int] = None
    survey_id: Optional[int] = None
    raw_text: str
    rating: Optional[int] = None
    is_anonymous: bool
    submitted_at: datetime
    analysis: Optional[AIAnalysisResponse] = None

    # Target info shortcuts
    course_title: Optional[str] = None
    service_name: Optional[str] = None
    survey_title: Optional[str] = None

    model_config = {"from_attributes": True}


class SentimentCategoryItem(BaseModel):
    id: int
    name: str
    entity_type: str  # "course", "service", "survey"
    department_name: Optional[str] = None
    total_feedbacks: int
    analyzed_feedbacks: int
    has_data: bool
    positive_percentage: Optional[float] = None
    neutral_percentage: Optional[float] = None
    negative_percentage: Optional[float] = None
    positive_count: int = 0
    neutral_count: int = 0
    negative_count: int = 0


class SentimentBreakdownResponse(BaseModel):
    category_type: str  # "course", "service", "survey"
    total_categories: int
    categories_with_data: int
    total_feedbacks: int
    total_analyzed: int
    overall_positive_percentage: Optional[float] = None
    overall_neutral_percentage: Optional[float] = None
    overall_negative_percentage: Optional[float] = None
    items: List[SentimentCategoryItem]

