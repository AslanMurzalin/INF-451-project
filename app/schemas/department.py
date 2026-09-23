from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)


class DepartmentResponse(DepartmentBase):
    department_id: int

    model_config = ConfigDict(from_attributes=True)


class DepartmentDetailResponse(DepartmentResponse):
    user_count: int = 0
    course_count: int = 0
