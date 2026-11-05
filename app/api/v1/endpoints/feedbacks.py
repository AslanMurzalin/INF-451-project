from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_lecturer_or_admin, require_any_authenticated
from app.models.user import User
from app.models.enums import FeedbackSourceType, SentimentLabel, AnalysisStatus
from app.crud.crud_feedback import feedback_crud
from app.schemas.sentiment import FeedbackCreate, FeedbackResponse, AIAnalysisResponse


router = APIRouter()


def _format_feedback_response(fb) -> FeedbackResponse:
    res = FeedbackResponse(
        feedback_id=fb.feedback_id,
        user_id=fb.user_id,
        source_type=fb.source_type,
        course_id=fb.course_id,
        service_id=fb.service_id,
        survey_id=fb.survey_id,
        raw_text=fb.raw_text,
        rating=fb.rating,
        is_anonymous=fb.is_anonymous,
        submitted_at=fb.submitted_at,
        course_title=fb.course.title if fb.course else None,
        service_name=fb.service.name if fb.service else None,
        survey_title=fb.survey.title if fb.survey else None,
    )
    if fb.analysis:
        res.analysis = AIAnalysisResponse(
            analysis_id=fb.analysis.analysis_id,
            feedback_id=fb.analysis.feedback_id,
            sentiment_label=fb.analysis.sentiment_label,
            sentiment_score=fb.analysis.sentiment_score,
            status=fb.analysis.status,
            summary_text=fb.analysis.summary_text,
            processed_at=fb.analysis.processed_at,
        )
    return res


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    obj_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
    auto_analyze: bool = Query(True, description="Automatically process sentiment scoring after submission")
):
    """
    US2.1 / US2.2 / US2.3 / US4.1: Submit new student/staff feedback.
    Triggers AI sentiment analysis automatically without blocking submission.
    """
    feedback = feedback_crud.create_feedback(
        db=db,
        obj_in=obj_in,
        user_id=current_user.user_id,
        auto_analyze=auto_analyze
    )
    return _format_feedback_response(feedback)


@router.get("/", response_model=List[FeedbackResponse])
def list_feedbacks(
    source_type: Optional[FeedbackSourceType] = None,
    course_id: Optional[int] = None,
    service_id: Optional[int] = None,
    survey_id: Optional[int] = None,
    sentiment_label: Optional[SentimentLabel] = None,
    status: Optional[AnalysisStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin),
):
    """
    US3 / US4.1: View feedbacks list with AI sentiment score/status.
    Available to Lecturer and Admin.
    """
    items = feedback_crud.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        source_type=source_type,
        course_id=course_id,
        service_id=service_id,
        survey_id=survey_id,
        sentiment_label=sentiment_label,
        status=status,
    )
    return [_format_feedback_response(fb) for fb in items]


@router.get("/{feedback_id}", response_model=FeedbackResponse)
def get_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """
    Retrieve single feedback entry with sentiment analysis details.
    """
    fb = feedback_crud.get_by_id(db, feedback_id=feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback entry not found.")
    return _format_feedback_response(fb)


@router.post("/{feedback_id}/analyze", response_model=AIAnalysisResponse)
def run_feedback_sentiment_analysis(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lecturer_or_admin),
):
    """
    US4.1: Manually trigger or re-run AI sentiment scoring for a feedback entry.
    """
    analysis = feedback_crud.process_sentiment_analysis(db, feedback_id=feedback_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Feedback not found or processing failed.")
    return AIAnalysisResponse(
        analysis_id=analysis.analysis_id,
        feedback_id=analysis.feedback_id,
        sentiment_label=analysis.sentiment_label,
        sentiment_score=analysis.sentiment_score,
        status=analysis.status,
        summary_text=analysis.summary_text,
        processed_at=analysis.processed_at,
    )

