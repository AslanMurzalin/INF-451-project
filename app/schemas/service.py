from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)  # e.g., "Library", "Cafeteria", "IT Support"


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = Field(None, min_length=2, max_length=100)


class ServiceResponse(ServiceBase):
    service_id: int

    model_config = ConfigDict(from_attributes=True)
