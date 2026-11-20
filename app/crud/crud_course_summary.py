from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models.course import Course
from app.models.feedback import Feedback
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.summary import CourseSummaryResponse
from app.services.course_summarizer import course_summarizer


class CRUDCourseSummary:
    def generate_summary(
        self,
        db: Session,
        course_id: int,
        current_user: User
    ) -> CourseSummaryResponse:
        """
        US5.2: Generate an AI summary for a course.
        Constraints:
          - Lecturer can only summarize courses they teach. Admin can summarize any course.
          - Summary is based ONLY on feedback of the selected course.
          - If the course has no feedback, returns 'Not enough feedback to summarize'.
          - Result is marked as AI-generated.
        """
        course = (
            db.query(Course)
            .options(joinedload(Course.department), joinedload(Course.lecturer))
            .filter(Course.course_id == course_id)
            .first()
        )
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        # RBAC: Lecturer can view only feedback and summaries for courses they teach
        if current_user.role == UserRole.LECTURER:
            if course.lecturer_id != current_user.user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only access feedback and AI summaries for courses you teach."
                )

        feedbacks = (
            db.query(Feedback)
            .options(joinedload(Feedback.analysis))
            .filter(Feedback.course_id == course_id)
            .all()
        )

        # US5.2 Acceptance Criteria: Course without feedback -> 'Not enough feedback to summarize'
        if not feedbacks or len(feedbacks) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough feedback to summarize"
            )

        fb_payload = []
        for fb in feedbacks:
            fb_payload.append({
                "raw_text": fb.raw_text,
                "rating": fb.rating,
                "sentiment_label": fb.analysis.sentiment_label.value if (fb.analysis and fb.analysis.sentiment_label) else None
            })

        summary = course_summarizer.summarize(course_title=course.title, feedbacks=fb_payload)

        return CourseSummaryResponse(
            course_id=course.course_id,
            course_title=course.title,
            department_name=course.department.name if course.department else None,
            lecturer_name=course.lecturer.full_name if course.lecturer else None,
            total_feedbacks=summary["total_feedbacks"],
            average_rating=summary["average_rating"],
            positive_count=summary["positive_count"],
            negative_count=summary["negative_count"],
            neutral_count=summary["neutral_count"],
            overview=summary["overview"],
            positive_points=summary["positive_points"],
            negative_points=summary["negative_points"],
            student_quotes=summary.get("student_quotes", []),
            is_ai_generated=True,
            generated_at=datetime.now(timezone.utc)
        )


course_summary_crud = CRUDCourseSummary()
