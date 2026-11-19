from app.crud.crud_user import user_crud
from app.crud.crud_department import department_crud
from app.crud.crud_course import course_crud
from app.crud.crud_service import service_crud
from app.crud.crud_survey import survey_crud
from app.crud.crud_feedback import feedback_crud
from app.crud.crud_topic import topic_crud
from app.crud.crud_course_summary import course_summary_crud

__all__ = [
    "user_crud",
    "department_crud",
    "course_crud",
    "service_crud",
    "survey_crud",
    "feedback_crud",
    "topic_crud",
    "course_summary_crud",
]
