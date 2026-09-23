from typing import List, Optional
from pydantic import BaseModel
from app.models.enums import FeedbackSourceType


class FeedbackSourceTypeInfo(BaseModel):
    source_type: FeedbackSourceType
    display_name: str
    description: str
    target_entity: str
    is_enabled: bool = True
    requires_target_id: bool = True


class FeedbackSourceSummary(BaseModel):
    total_courses: int
    total_services: int
    active_surveys: int
    total_surveys: int
    total_departments: int
    source_types: List[FeedbackSourceTypeInfo]
