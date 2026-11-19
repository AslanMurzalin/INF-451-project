import pytest
from app.models.enums import UserRole, FeedbackSourceType, SentimentLabel, AnalysisStatus
from app.models.course import Course
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis
from app.models.user import User
from app.services.topic_detector import topic_detector
from app.services.course_summarizer import course_summarizer
from app.crud.crud_topic import topic_crud
from app.crud.crud_feedback import feedback_crud
from app.schemas.sentiment import FeedbackCreate


def test_topic_detector_classification():
    text_grading = "Our professor had significant grading delays and assignment results were very late."
    topics = topic_detector.detect_topics(text_grading)
    topic_names = [t[0] for t in topics]
    assert "Grading Delays" in topic_names

    text_cafe = "The cafeteria food and dining hall cleanliness require immediate hygiene inspection."
    topics_cafe = topic_detector.detect_topics(text_cafe)
    topic_names_cafe = [t[0] for t in topics_cafe]
    assert "Cafeteria Hygiene & Food Quality" in topic_names_cafe

    text_labs = "The practical hands-on labs and coding exercises were engaging and helpful."
    topics_labs = topic_detector.detect_topics(text_labs)
    topic_names_labs = [t[0] for t in topics_labs]
    assert "Practical Labs & Hands-on Exercises" in topic_names_labs


def test_topic_detection_constraint_min_count(db_session, test_department, admin_user):
    """
    US5.1 Constraint: A topic is shown only if it appears in more than one entry (count >= 2).
    """
    course = Course(
        title="CS-301 Operating Systems",
        department_id=test_department.department_id,
        lecturer_id=admin_user.user_id
    )
    db_session.add(course)
    db_session.commit()

    # 1. First feedback with grading delays
    fb1_in = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="The grading delays on midterms made it hard to know our progress before finals.",
        rating=2,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb1_in, user_id=admin_user.user_id, auto_analyze=True)

    # With only 1 feedback, min_count=2 should return 0 topics
    topics_1 = topic_crud.get_recurring_topics(db_session, min_count=2)
    assert len(topics_1.items) == 0

    # 2. Second feedback ALSO about grading delays
    fb2_in = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="Late grading and delayed homework scores were very frustrating this term.",
        rating=2,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb2_in, user_id=admin_user.user_id, auto_analyze=True)

    # Now count == 2, so the topic must appear!
    topics_2 = topic_crud.get_recurring_topics(db_session, min_count=2)
    assert len(topics_2.items) >= 1
    grading_topic = next(t for t in topics_2.items if t.name == "Grading Delays")
    assert grading_topic.entry_count >= 2
    assert grading_topic.negative_count >= 1


def test_topic_drill_down_endpoints(client, db_session, test_department, lecturer_user, lecturer_headers):
    """
    US5.1 Scenario 1 & 2: View detected topics and open entries of a topic.
    """
    course = Course(
        title="CS-302 Computer Networks",
        department_id=test_department.department_id,
        lecturer_id=lecturer_user.user_id
    )
    db_session.add(course)
    db_session.commit()

    # Create 2 feedbacks for Wi-Fi topic
    fb1 = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="Campus wi-fi connection dropped constantly during online quizzes and portal login failed.",
        rating=1,
        is_anonymous=False
    )
    fb2 = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="The network speed and campus wi-fi need urgent it support upgrades.",
        rating=2,
        is_anonymous=True
    )
    feedback_crud.create_feedback(db_session, fb1, user_id=lecturer_user.user_id, auto_analyze=True)
    feedback_crud.create_feedback(db_session, fb2, user_id=lecturer_user.user_id, auto_analyze=True)

    # 1. Get topics list
    res = client.get("/api/v1/topics?min_count=2", headers=lecturer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_topics"] >= 1
    topic_item = next(t for t in data["items"] if "Wi-Fi" in t["name"])
    topic_id = topic_item["topic_id"]

    # 2. Drill-down into the topic
    detail_res = client.get(f"/api/v1/topics/{topic_id}", headers=lecturer_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["topic_id"] == topic_id
    assert detail_data["entry_count"] >= 2
    assert len(detail_data["feedbacks"]) >= 2
    # Verify feedback entries contain text
    assert any("wi-fi" in fb["raw_text"].lower() for fb in detail_data["feedbacks"])


def test_course_summary_generation_success(client, db_session, test_department, lecturer_user, lecturer_headers):
    """
    US5.2 Scenario 1: Generate an AI summary for a course with feedback.
    Shows main positive points, main problems, and marked as AI-generated.
    """
    course = Course(
        title="CS-401 Machine Learning",
        department_id=test_department.department_id,
        lecturer_id=lecturer_user.user_id
    )
    db_session.add(course)
    db_session.commit()

    # Add positive and problem feedback
    fb1 = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="The lecturer explains machine learning models with outstanding clarity and practical lab demos were wonderful!",
        rating=5,
        is_anonymous=False
    )
    fb2 = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=course.course_id,
        raw_text="Heavy assignment workload with tight deadlines and grading delays on our project reports.",
        rating=2,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb1, user_id=lecturer_user.user_id, auto_analyze=True)
    feedback_crud.create_feedback(db_session, fb2, user_id=lecturer_user.user_id, auto_analyze=True)

    res = client.get(f"/api/v1/courses/{course.course_id}/summary", headers=lecturer_headers)
    assert res.status_code == 200
    summary = res.json()

    assert summary["course_id"] == course.course_id
    assert summary["course_title"] == "CS-401 Machine Learning"
    assert summary["total_feedbacks"] == 2
    assert summary["is_ai_generated"] is True
    assert summary["overview"] is not None
    assert len(summary["positive_points"]) >= 1
    assert len(summary["negative_points"]) >= 1
    assert summary["average_rating"] == 3.5


def test_course_summary_empty_course_not_enough_feedback(client, db_session, test_department, lecturer_user, lecturer_headers):
    """
    US5.2 Scenario 2: Course without feedback returns 'Not enough feedback to summarize'.
    """
    empty_course = Course(
        title="CS-499 Empty Capstone",
        department_id=test_department.department_id,
        lecturer_id=lecturer_user.user_id
    )
    db_session.add(empty_course)
    db_session.commit()

    res = client.get(f"/api/v1/courses/{empty_course.course_id}/summary", headers=lecturer_headers)
    assert res.status_code == 400
    assert "Not enough feedback to summarize" in res.json()["detail"]


def test_course_summary_lecturer_rbac(client, db_session, test_department, lecturer_headers, admin_user):
    """
    US5.2 RBAC: Lecturer cannot access summary of a course taught by another lecturer.
    """
    other_course = Course(
        title="MATH-201 Linear Algebra",
        department_id=test_department.department_id,
        lecturer_id=admin_user.user_id  # Not taught by lecturer_user
    )
    db_session.add(other_course)
    db_session.commit()

    fb = FeedbackCreate(
        source_type=FeedbackSourceType.COURSE_EVALUATION,
        course_id=other_course.course_id,
        raw_text="Great course material and clear explanations.",
        rating=5,
        is_anonymous=False
    )
    feedback_crud.create_feedback(db_session, fb, user_id=admin_user.user_id, auto_analyze=True)

    # lecturer_user tries to access other_course summary -> 403 Forbidden
    res = client.get(f"/api/v1/courses/{other_course.course_id}/summary", headers=lecturer_headers)
    assert res.status_code == 403
