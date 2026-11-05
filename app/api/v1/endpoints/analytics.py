from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.crud.crud_feedback import feedback_crud
from app.schemas.sentiment import SentimentBreakdownResponse


router = APIRouter()


@router.get("/sentiment-breakdown", response_model=SentimentBreakdownResponse)
def get_sentiment_breakdown(
    category_type: str = Query(
        "course",
        description="Category to break down sentiment: 'course', 'service', or 'survey'"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    US4.2: Sentiment Breakdown by Category.
    - Breaks down AI sentiment scores across courses, services, or surveys.
    - Percentages are calculated ONLY from entries that already have a sentiment.
    - Handles categories without feedback with empty state ('has_data=False', 'No data', no percentages).
    - Access restricted to ADMIN role only.
    """
    category_type_norm = category_type.strip().lower()
    if category_type_norm not in ["course", "service", "survey"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid category_type. Choose from 'course', 'service', or 'survey'."
        )

    return feedback_crud.get_sentiment_breakdown(db, category_type=category_type_norm)

