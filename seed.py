from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.department import Department
from app.models.user import User
from app.models.course import Course
from app.models.service import Service
from app.models.survey import Survey


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

        # 4. Campus Services
        services_data = [
            {"name": "Central University Library", "category": "Library"},
            {"name": "Main Campus Cafeteria", "category": "Cafeteria"},
            {"name": "IT Helpdesk & Systems Support", "category": "IT Support"},
            {"name": "Student Counseling & Wellness Center", "category": "Health & Counseling"},
            {"name": "University Sports & Recreation Complex", "category": "Athletics"}
        ]

        for s in services_data:
            srv = db.query(Service).filter_by(name=s["name"]).first()
            if not srv:
                srv = Service(name=s["name"], category=s["category"])
                db.add(srv)
                db.flush()
                print(f"  + Added Service: {s['name']} [{s['category']}]")

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
