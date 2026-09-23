from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SurveyBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    start_date: datetime
    end_date: datetime

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


class SurveyCreate(SurveyBase):
    pass


class SurveyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


class SurveyResponse(SurveyBase):
    survey_id: int
    created_by: Optional[int] = None
    creator_name: Optional[str] = None
    is_active: bool = False

    model_config = ConfigDict(from_attributes=True)
