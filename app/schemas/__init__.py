from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest, PasswordChangeRequest, RefreshTokenRequest
from app.schemas.user import UserCreate, UserUpdate, UserProfileUpdate, UserResponse
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentDetailResponse
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseDetailResponse
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyResponse
from app.schemas.feedback_source import FeedbackSourceTypeInfo, FeedbackSourceSummary

__all__ = [
    "MessageResponse",
    "PaginatedResponse",
    "LoginRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "RegisterRequest",
    "PasswordChangeRequest",
    "UserCreate",
    "UserUpdate",
    "UserProfileUpdate",
    "UserResponse",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentResponse",
    "DepartmentDetailResponse",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseDetailResponse",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "SurveyCreate",
    "SurveyUpdate",
    "SurveyResponse",
    "FeedbackSourceTypeInfo",
    "FeedbackSourceSummary",
]
