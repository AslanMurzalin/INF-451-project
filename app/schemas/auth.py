from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user_id: int
    full_name: str
    email: str
    role: UserRole


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.STUDENT
    department_id: Optional[int] = None
    admin_secret: Optional[str] = None  # Required only if registering as ADMIN


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=128)
