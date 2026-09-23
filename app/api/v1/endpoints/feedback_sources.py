from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud.crud_course import course_crud
from app.crud.crud_service import service_crud
from app.crud.crud_survey import survey_crud
from app.crud.crud_department import department_crud
from app.models.user import User
from app.models.enums import FeedbackSourceType
from app.schemas.feedback_source import FeedbackSourceTypeInfo, FeedbackSourceSummary

router = APIRouter()

CONFIGURED_SOURCE_TYPES = [
    FeedbackSourceTypeInfo(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        display_name="Course Evaluation",
        description="Structured student evaluation for academic courses and their instructors.",
        target_entity="course",
        is_enabled=True,
        requires_target_id=True
    ),
    FeedbackSourceTypeInfo(
        source_type=FeedbackSourceType.SURVEY,
        display_name="Institutional Survey",
        description="Time-bounded campus-wide or departmental feedback campaigns.",
        target_entity="survey",
        is_enabled=True,
        requires_target_id=True
    ),
    FeedbackSourceTypeInfo(
        source_type=FeedbackSourceType.SERVICE_REVIEW,
        display_name="Campus Service Review",
        description="Continuous feedback on campus facilities (e.g. Library, Cafeteria, IT Support).",
        target_entity="service",
        is_enabled=True,
        requires_target_id=True
    ),
]


@router.get("/types", response_model=List[FeedbackSourceTypeInfo])
def get_feedback_source_types(
    _: User = Depends(get_current_user)
):
    """
    US1.2: Retrieve defined feedback source types (course evaluation, survey, service review) and metadata.
    """
    return CONFIGURED_SOURCE_TYPES


@router.get("/summary", response_model=FeedbackSourceSummary)
def get_feedback_sources_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.2 & US1.3: Aggregated overview of all feedback sources configured in the system.
    """
    total_courses = course_crud.count(db)
    total_services = service_crud.count(db)
    active_surveys = survey_crud.count(db, status="active")
    total_surveys = survey_crud.count(db)
    total_departments = department_crud.count(db)

    return FeedbackSourceSummary(
        total_courses=total_courses,
        total_services=total_services,
        active_surveys=active_surveys,
        total_surveys=total_surveys,
        total_departments=total_departments,
        source_types=CONFIGURED_SOURCE_TYPES
    )
