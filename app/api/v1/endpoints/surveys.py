from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_lecturer_or_admin
from app.crud.crud_survey import survey_crud
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[SurveyResponse])
def list_surveys(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(active|upcoming|past)$"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.2: List surveys with optional status filter ('active', 'upcoming', 'past').
    """
    skip = (page - 1) * page_size
    surveys = survey_crud.get_multi(db, skip=skip, limit=page_size, status=status_filter)
    total = survey_crud.count(db, status=status_filter)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = [survey_crud.to_response(s) for s in surveys]

    return PaginatedResponse[SurveyResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(
    survey_in: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin)
):
    """
    US1.2: Admin or Lecturer creates a survey feedback source with active start and end dates.
    """
    survey = survey_crud.create(db, obj_in=survey_in, user_id=current_user.user_id)
    return survey_crud.to_response(survey)


@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.2: Get survey details and active status.
    """
    survey = survey_crud.get_by_id(db, survey_id=survey_id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found."
        )
    return survey_crud.to_response(survey)


@router.put("/{survey_id}", response_model=SurveyResponse)
def update_survey(
    survey_id: int,
    survey_in: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    US1.2: Admin or the survey creator updates survey information.
    """
    survey = survey_crud.get_by_id(db, survey_id=survey_id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found."
        )

    if current_user.role != UserRole.ADMIN and survey.created_by != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this survey."
        )

    updated = survey_crud.update(db, db_survey=survey, obj_in=survey_in)
    return survey_crud.to_response(updated)


@router.delete("/{survey_id}", response_model=MessageResponse)
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    US1.2: Admin or the survey creator deletes a survey.
    """
    survey = survey_crud.get_by_id(db, survey_id=survey_id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found."
        )

    if current_user.role != UserRole.ADMIN and survey.created_by != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this survey."
        )

    survey_crud.delete(db, survey_id=survey_id)
    return MessageResponse(message=f"Survey {survey_id} deleted successfully.")
