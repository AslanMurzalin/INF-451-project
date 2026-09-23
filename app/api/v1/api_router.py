from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    departments,
    courses,
    services,
    surveys,
    feedback_sources,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(users.router, prefix="/users", tags=["Users Management (Admin)"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses (Data Sources)"])
api_router.include_router(services.router, prefix="/services", tags=["Campus Services (Data Sources)"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["Surveys (Data Sources)"])
api_router.include_router(feedback_sources.router, prefix="/sources", tags=["Feedback Sources Configuration"])
