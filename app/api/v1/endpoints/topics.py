from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_lecturer_or_admin, get_current_user
from app.models.user import User
from app.crud.crud_topic import topic_crud
from app.schemas.topic import TopicListResponse, TopicDetailResponse
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=TopicListResponse)
def list_recurring_topics(
    min_count: int = Query(2, ge=1, description="Minimum occurrences required to show topic (default 2 per US5.1 constraint)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin),
):
    """
    US5.1: Retrieve automatically detected recurring topics/problems.
    Constraint: Only topics with > 1 entry (min_count >= 2) are displayed.
    Available to Staff members (Lecturer and Admin).
    """
    return topic_crud.get_recurring_topics(db, min_count=min_count)


@router.get("/{topic_id}", response_model=TopicDetailResponse)
def get_topic_detail(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin),
):
    """
    US5.1: Retrieve detailed topic information with all related feedback entries (drill-down).
    """
    detail = topic_crud.get_topic_detail(db, topic_id=topic_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with id {topic_id} not found."
        )
    return detail


@router.post("/reindex", response_model=MessageResponse)
def reindex_all_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin),
):
    """
    US5.1: Re-indexes all feedback entries with AI topic detection.
    """
    count = topic_crud.reindex_all_topics(db)
    return MessageResponse(message=f"Successfully re-indexed topics across {count} feedback entries.")
