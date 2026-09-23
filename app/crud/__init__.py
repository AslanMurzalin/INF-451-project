from app.crud.crud_user import user_crud
from app.crud.crud_department import department_crud
from app.crud.crud_course import course_crud
from app.crud.crud_service import service_crud
from app.crud.crud_survey import survey_crud

__all__ = [
    "user_crud",
    "department_crud",
    "course_crud",
    "service_crud",
    "survey_crud",
]
