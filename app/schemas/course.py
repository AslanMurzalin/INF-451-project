from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    lecturer_id: Optional[int] = None
    department_id: int


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    lecturer_id: Optional[int] = None
    department_id: Optional[int] = None


class CourseResponse(CourseBase):
    course_id: int

    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(CourseResponse):
    lecturer_name: Optional[str] = None
    department_name: Optional[str] = None
