from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CourseSummaryResponse(BaseModel):
    course_id: int
    course_title: str
    department_name: Optional[str] = None
    lecturer_name: Optional[str] = None
    total_feedbacks: int
    average_rating: Optional[float] = None
    positive_count: int = 0
    negative_count: int = 0
    neutral_count: int = 0
    overview: str
    positive_points: List[str]
    negative_points: List[str]
    is_ai_generated: bool = True
    generated_at: datetime

    model_config = {"from_attributes": True}
