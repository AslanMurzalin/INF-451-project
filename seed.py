from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.enums import UserRole, FeedbackSourceType, SentimentLabel, AnalysisStatus
from app.models.department import Department
from app.models.user import User
from app.models.course import Course
from app.models.service import Service
from app.models.survey import Survey
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis


import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def seed_database():
    db: Session = SessionLocal()
    try:
        print("[*] Seeding database...")

        # 1. Departments
        dept_names = [
            "Computer Science & Engineering",
            "Information Systems",
            "Data Science & Artificial Intelligence",
            "Mathematics & Statistics"
        ]
        dept_map = {}
        for name in dept_names:
            dept = db.query(Department).filter_by(name=name).first()
            if not dept:
                dept = Department(name=name)
                db.add(dept)
                db.flush()
                print(f"  + Added Department: {name}")
            dept_map[name] = dept

        # 2. Users
        users_data = [
            {
                "full_name": "System Administrator",
                "email": "admin@university.edu",
                "password": "AdminPassword123!",
                "role": UserRole.ADMIN,
                "dept": "Computer Science & Engineering"
            },
            {
                "full_name": "Dr. Alan Smith",
                "email": "alan.smith@university.edu",
                "password": "LecturerPassword123!",
                "role": UserRole.LECTURER,
                "dept": "Computer Science & Engineering"
            },
            {
                "full_name": "Dr. Sarah Connor",
                "email": "sarah.connor@university.edu",
                "password": "LecturerPassword123!",
                "role": UserRole.LECTURER,
                "dept": "Data Science & Artificial Intelligence"
            },
            {
                "full_name": "Alice Johnson",
                "email": "alice.student@university.edu",
                "password": "StudentPassword123!",
                "role": UserRole.STUDENT,
                "dept": "Computer Science & Engineering"
            },
            {
                "full_name": "Bob Miller",
                "email": "bob.student@university.edu",
                "password": "StudentPassword123!",
                "role": UserRole.STUDENT,
                "dept": "Information Systems"
            }
        ]

        user_map = {}
        for u in users_data:
            user = db.query(User).filter_by(email=u["email"]).first()
            if not user:
                user = User(
                    full_name=u["full_name"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    department_id=dept_map[u["dept"]].department_id
                )
                db.add(user)
                db.flush()
                print(f"  + Added User: {u['full_name']} ({u['role'].value})")
            user_map[u["email"]] = user

        # 3. Courses
        courses_data = [
            {
                "title": "INF451 - Advanced Software Architecture",
                "lecturer_email": "alan.smith@university.edu",
                "dept": "Computer Science & Engineering"
            },
            {
                "title": "CS302 - Operating Systems & Distributed Architecture",
                "lecturer_email": "alan.smith@university.edu",
                "dept": "Computer Science & Engineering"
            },
            {
                "title": "AI401 - Deep Learning & Natural Language Understanding",
                "lecturer_email": "sarah.connor@university.edu",
                "dept": "Data Science & Artificial Intelligence"
            }
        ]

        course_map = {}
        for c in courses_data:
            course = db.query(Course).filter_by(title=c["title"]).first()
            if not course:
                course = Course(
                    title=c["title"],
                    lecturer_id=user_map[c["lecturer_email"]].user_id,
                    department_id=dept_map[c["dept"]].department_id
                )
                db.add(course)
                db.flush()
                print(f"  + Added Course: {c['title']}")
            course_map[c["title"]] = course

        # 4. Campus Services
        services_data = [
            {"name": "Central University Library", "category": "Library"},
            {"name": "Main Campus Cafeteria", "category": "Cafeteria"},
            {"name": "IT Helpdesk & Systems Support", "category": "IT Support"},
            {"name": "Student Counseling & Wellness Center", "category": "Health & Counseling"},
            {"name": "University Sports & Recreation Complex", "category": "Athletics"}
        ]

        service_map = {}
        for s in services_data:
            srv = db.query(Service).filter_by(name=s["name"]).first()
            if not srv:
                srv = Service(name=s["name"], category=s["category"])
                db.add(srv)
                db.flush()
                print(f"  + Added Service: {s['name']} [{s['category']}]")
            service_map[s["name"]] = srv

        # 5. Surveys
        now = datetime.now(timezone.utc)
        surveys_data = [
            {
                "title": "Fall 2026 Mid-Semester Campus Experience Survey",
                "created_by": user_map["admin@university.edu"].user_id,
                "start_date": now - timedelta(days=7),
                "end_date": now + timedelta(days=21)
            },
            {
                "title": "Spring 2026 End-of-Term General Satisfaction Survey",
                "created_by": user_map["admin@university.edu"].user_id,
                "start_date": now - timedelta(days=120),
                "end_date": now - timedelta(days=60)
            },
            {
                "title": "Spring 2027 Campus Modernization & Technology Survey",
                "created_by": user_map["alan.smith@university.edu"].user_id,
                "start_date": now + timedelta(days=60),
                "end_date": now + timedelta(days=90)
            }
        ]

        survey_map = {}
        for s in surveys_data:
            srv = db.query(Survey).filter_by(title=s["title"]).first()
            if not srv:
                srv = Survey(
                    title=s["title"],
                    created_by=s["created_by"],
                    start_date=s["start_date"],
                    end_date=s["end_date"]
                )
                db.add(srv)
                db.flush()
                print(f"  + Added Survey: {s['title']}")
            survey_map[s["title"]] = srv

        # 6. Sprint 4 Seed: Feedbacks with AI Sentiment Scoring
        if db.query(Feedback).count() == 0:
            print("[*] Seeding Feedbacks & AI Analyses for Sprint 4...")
            feedbacks_to_seed = [
                # Course 1: INF451 (Positive, Neutral, Negative)
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["INF451 - Advanced Software Architecture"].course_id,
                    "raw_text": "Excellent course on distributed architectures and microservices. The practical laboratory assignments were challenging and very helpful.",
                    "rating": 5,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.95,
                    "status": AnalysisStatus.DONE
                },
                {
                    "user_id": user_map["bob.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["INF451 - Advanced Software Architecture"].course_id,
                    "raw_text": "Lecturer explains architectural trade-offs very effectively. Covered standard topics at a steady pace.",
                    "rating": 3,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.NEUTRAL,
                    "score": 0.65,
                    "status": AnalysisStatus.DONE
                },
                {
                    "user_id": None,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["INF451 - Advanced Software Architecture"].course_id,
                    "raw_text": "Unclear grading criteria on lab assignments and unexpected delays in project feedback.",
                    "rating": 2,
                    "is_anonymous": True,
                    "sentiment": SentimentLabel.NEGATIVE,
                    "score": 0.88,
                    "status": AnalysisStatus.DONE
                },
                # Course 2: CS302 (Positive, Positive, Neutral)
                {
                    "user_id": user_map["bob.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["CS302 - Operating Systems & Distributed Architecture"].course_id,
                    "raw_text": "Kernel threads and memory paging labs gave deep insights into OS internals. Dr. Alan Smith provides clear breakdowns.",
                    "rating": 5,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.96,
                    "status": AnalysisStatus.DONE
                },
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["CS302 - Operating Systems & Distributed Architecture"].course_id,
                    "raw_text": "Great lectures on synchronization primitives and deadlock prevention. Very clear and inspiring.",
                    "rating": 5,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.92,
                    "status": AnalysisStatus.DONE
                },
                # Course 3: AI401 (Positive, Negative, and 1 Pending)
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["AI401 - Deep Learning & Natural Language Understanding"].course_id,
                    "raw_text": "The lectures on attention mechanisms and large language models are cutting-edge. Highly engaging instructor.",
                    "rating": 4,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.91,
                    "status": AnalysisStatus.DONE
                },
                {
                    "user_id": user_map["bob.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["AI401 - Deep Learning & Natural Language Understanding"].course_id,
                    "raw_text": "GPU training cluster experienced horrible downtime during assignment week. Extremely frustrating and delayed our submissions.",
                    "rating": 2,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.NEGATIVE,
                    "score": 0.94,
                    "status": AnalysisStatus.DONE
                },
                {
                    "user_id": None,
                    "source_type": FeedbackSourceType.COURSE_EVALUATION,
                    "course_id": course_map["AI401 - Deep Learning & Natural Language Understanding"].course_id,
                    "raw_text": "Just submitted evaluation awaiting AI scoring.",
                    "rating": 4,
                    "is_anonymous": True,
                    "sentiment": None,
                    "score": None,
                    "status": AnalysisStatus.PENDING
                },
                # Services:
                # 1. Central University Library
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.SERVICE_REVIEW,
                    "service_id": service_map["Central University Library"].service_id,
                    "raw_text": "Quiet study rooms and rich digital journal access make studying very productive.",
                    "rating": 5,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.90,
                    "status": AnalysisStatus.DONE
                },
                # 2. Main Campus Cafeteria
                {
                    "user_id": user_map["bob.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.SERVICE_REVIEW,
                    "service_id": service_map["Main Campus Cafeteria"].service_id,
                    "raw_text": "Slow service during peak hours and limited warm meal selections. Needs improvements.",
                    "rating": 2,
                    "is_anonymous": True,
                    "sentiment": SentimentLabel.NEGATIVE,
                    "score": 0.86,
                    "status": AnalysisStatus.DONE
                },
                # 3. IT Helpdesk & Systems Support
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.SERVICE_REVIEW,
                    "service_id": service_map["IT Helpdesk & Systems Support"].service_id,
                    "raw_text": "Fast response when resetting portal credentials in the computer lab. Wi-Fi works well.",
                    "rating": 4,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.88,
                    "status": AnalysisStatus.DONE
                },
                # Services 4 & 5 (Student Counseling & Recreation) deliberately left with NO feedback to test "No data" state!
                # Surveys:
                # Survey 1: Fall 2026 Mid-Semester
                {
                    "user_id": user_map["bob.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.SURVEY,
                    "survey_id": survey_map["Fall 2026 Mid-Semester Campus Experience Survey"].survey_id,
                    "raw_text": "Extracurricular clubs are very active this semester. Expanding evening study spaces would make campus life even better.",
                    "rating": 4,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.85,
                    "status": AnalysisStatus.DONE
                },
                # Survey 2: Spring 2026 End-of-Term
                {
                    "user_id": user_map["alice.student@university.edu"].user_id,
                    "source_type": FeedbackSourceType.SURVEY,
                    "survey_id": survey_map["Spring 2026 End-of-Term General Satisfaction Survey"].survey_id,
                    "raw_text": "The new SIS interface is extremely clean and easy to navigate. Having course evaluation and survey tracking built directly into the student portal makes submission effortless.",
                    "rating": 5,
                    "is_anonymous": False,
                    "sentiment": SentimentLabel.POSITIVE,
                    "score": 0.97,
                    "status": AnalysisStatus.DONE
                }
            ]

            for fb_info in feedbacks_to_seed:
                fb = Feedback(
                    user_id=fb_info["user_id"],
                    source_type=fb_info["source_type"],
                    course_id=fb_info.get("course_id"),
                    service_id=fb_info.get("service_id"),
                    survey_id=fb_info.get("survey_id"),
                    raw_text=fb_info["raw_text"],
                    rating=fb_info["rating"],
                    is_anonymous=fb_info["is_anonymous"],
                    submitted_at=now - timedelta(days=2),
                )
                db.add(fb)
                db.flush()

                analysis = AIAnalysis(
                    feedback_id=fb.feedback_id,
                    sentiment_label=fb_info["sentiment"],
                    sentiment_score=fb_info["score"],
                    status=fb_info["status"],
                    processed_at=now - timedelta(days=2) if fb_info["status"] == AnalysisStatus.DONE else now,
                )
                db.add(analysis)

            print(f"  + Added {len(feedbacks_to_seed)} Feedbacks with AI Sentiment Analyses")

        db.commit()
        print("[SUCCESS] Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
