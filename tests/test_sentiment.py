import pytest
from app.models.enums import UserRole, FeedbackSourceType, SentimentLabel, AnalysisStatus
from app.models.department import Department
from app.models.user import User
from app.models.course import Course
from app.models.service import Service
from app.models.survey import Survey
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis
from app.schemas.sentiment import FeedbackCreate
from app.services.sentiment_analyzer import sentiment_analyzer
from app.crud.crud_feedback import feedback_crud


def test_sentiment_analyzer_positive():
    text = "The course structure is brilliant and the lecturer explains complex topics with great clarity and passion."
    label, score = sentiment_analyzer.analyze(text, rating=5)
    assert label == SentimentLabel.POSITIVE
    assert score > 0.6


def test_sentiment_analyzer_negative():
    text = "Awful experience, terrible grading delay, broken equipment, and useless instructions."
    label, score = sentiment_analyzer.analyze(text, rating=1)
    assert label == SentimentLabel.NEGATIVE
    assert score > 0.6


def test_sentiment_analyzer_neutral():
    text = "Regular standard classroom lecture covering normal syllabus materials."
    label, score = sentiment_analyzer.analyze(text, rating=3)
    assert label == SentimentLabel.NEUTRAL


def test_feedback_crud_create_with_auto_sentiment(db_session, test_department, admin_user):
    course = Course(title="TEST-101 Python Architecture", department_id=test_department.department_id, lecturer_id=admin_user.user_id)
    db_session.add(course)
    db_session.commit()

    fb_in = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="The professor was outstanding and the practical labs were very helpful!",
        rating=5,
        is_anonymous=False
    )

    fb = feedback_crud.create_feedback(db_session, fb_in, user_id=admin_user.user_id, auto_analyze=True)
    assert fb.feedback_id is not None
    assert fb.analysis is not None
    assert fb.analysis.status == AnalysisStatus.DONE
    assert fb.analysis.sentiment_label == SentimentLabel.POSITIVE
    assert fb.analysis.sentiment_score is not None


def test_feedback_sentiment_pending_state(db_session, test_department, admin_user):
    course = Course(title="TEST-102 Algorithms", department_id=test_department.department_id, lecturer_id=admin_user.user_id)
    db_session.add(course)
    db_session.commit()

    fb_in = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="Feedback just submitted without immediate analysis.",
        rating=4,
        is_anonymous=False
    )

    # auto_analyze=False simulates non-blocking pending queue
    fb = feedback_crud.create_feedback(db_session, fb_in, user_id=admin_user.user_id, auto_analyze=False)
    assert fb.analysis.status == AnalysisStatus.PENDING
    assert fb.analysis.sentiment_label is None

    # Now process it
    analysis = feedback_crud.process_sentiment_analysis(db_session, fb.feedback_id)
    assert analysis.status == AnalysisStatus.DONE
    assert analysis.sentiment_label in [SentimentLabel.POSITIVE, SentimentLabel.NEUTRAL, SentimentLabel.NEGATIVE]


def test_sentiment_breakdown_by_category_and_empty_state(db_session, test_department, admin_user):
    # Service with feedback
    srv_with_fb = Service(name="Test Active Cafeteria", category="Food")
    # Service with NO feedback
    srv_empty = Service(name="Test Empty Gym", category="Sports")
    db_session.add_all([srv_with_fb, srv_empty])
    db_session.commit()

    # Add positive feedback to srv_with_fb
    fb1 = FeedbackCreate(
        source_type=FeedbackSourceType.SERVICE_REVIEW,
        service_id=srv_with_fb.service_id,
        raw_text="Delicious fresh meals and very clean dining hall!",
        rating=5,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb1, user_id=admin_user.user_id, auto_analyze=True)

    # Also add 1 pending feedback (should not be counted in percentages)
    fb_pending = FeedbackCreate(
        source_type=FeedbackSourceType.SERVICE_REVIEW,
        service_id=srv_with_fb.service_id,
        raw_text="Waiting for review",
        rating=3,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb_pending, user_id=admin_user.user_id, auto_analyze=False)

    breakdown = feedback_crud.get_sentiment_breakdown(db_session, "service")
    assert breakdown.category_type == "service"

    item_active = next(it for it in breakdown.items if it.id == srv_with_fb.service_id)
    assert item_active.has_data is True
    assert item_active.total_feedbacks == 2
    assert item_active.analyzed_feedbacks == 1
    # Only analyzed feedback counts: 1 positive out of 1 analyzed = 100%
    assert item_active.positive_percentage == 100.0
    assert item_active.negative_percentage == 0.0

    # Empty service must show has_data=False and None percentages (No data)
    item_empty = next(it for it in breakdown.items if it.id == srv_empty.service_id)
    assert item_empty.has_data is False
    assert item_empty.total_feedbacks == 0
    assert item_empty.analyzed_feedbacks == 0
    assert item_empty.positive_percentage is None
    assert item_empty.negative_percentage is None

