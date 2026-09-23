from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.enums import UserRole


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    department_id: Optional[int] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department_id: Optional[int] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    role: UserRole
    department_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
