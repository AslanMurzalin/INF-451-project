# AI-Enhanced Student Feedback Analysis System
## Sprint 1 — Foundations (Auth & Data Sources)

A clean, modular, model-oriented FastAPI monolith implementing Sprint 1 Foundations:
- **US1.1 — Student/Staff Login**: User authentication (JWT + bcrypt), university role-based access control (`student`, `lecturer`, `admin`), profile & password management.
- **US1.2 — Admin Configures Feedback Sources**: Feedback source types (`course_evaluation`, `survey`, `service_review`), survey management with active/upcoming/past windows, source configuration overview.
- **US1.3 — Admin Manages Courses/Services**: Department CRUD, Course management linking to lecturers and departments, and Campus Services with categories.

---

### Tech Stack
- **Framework**: FastAPI (v0.115+)
- **ORM & Migrations**: SQLAlchemy (v2.0+) & Alembic
- **Validation**: Pydantic v2
- **Security**: PyJWT & bcrypt
- **Rate Limiting**: SlowAPI
- **Testing**: pytest & HTTPX

---

### File Structure (Model-Oriented)

```
├── app/
│   ├── core/
│   │   ├── config.py           # Application settings (Pydantic BaseSettings)
│   │   ├── database.py         # SQLAlchemy engine, session, Base, get_db
│   │   ├── security.py         # Bcrypt password hashing & PyJWT tokens
│   │   ├── rate_limiter.py     # SlowAPI limiter instance
│   │   └── dependencies.py     # Auth dependencies & RBAC RoleChecker
│   ├── models/                 # Complete ERD models
│   │   ├── enums.py            # UserRole, FeedbackSourceType, SentimentLabel, etc.
│   │   ├── department.py       # Department model
│   │   ├── user.py             # User model
│   │   ├── course.py           # Course model
│   │   ├── service.py          # Campus Service model
│   │   ├── survey.py           # Survey model
│   │   ├── feedback.py         # Feedback model
│   │   ├── ai_analysis.py      # AIAnalysis model
│   │   ├── topic.py            # Topic & FeedbackTopic models
│   │   ├── trend_snapshot.py   # TrendSnapshot model
│   │   ├── alert.py            # Alert model
│   │   └── report.py           # Report model
│   ├── schemas/                # Pydantic schemas (DTOs)
│   ├── crud/                   # Repository / CRUD layer
│   └── api/
│       └── v1/
│           ├── api_router.py
│           └── endpoints/      # 27 RESTful endpoints
│               ├── auth.py
│               ├── users.py
│               ├── departments.py
│               ├── courses.py
│               ├── services.py
│               ├── surveys.py
│               └── feedback_sources.py
├── alembic/                    # Database migrations
├── alembic.ini
├── requirements.txt
├── seed.py                     # Initial database seeding script
├── test_main.http              # HTTP Client requests for testing
└── tests/                      # Automated test suite (30 passing tests)
```

---

### Getting Started

1. **Activate Virtual Environment**:
   ```powershell
   .venv\Scripts\activate
   ```

2. **Run Database Migrations**:
   ```powershell
   alembic upgrade head
   ```

3. **Seed Database with Sample Data**:
   ```powershell
   python seed.py
   ```
   **Default Seed Accounts**:
   | Role | Email | Password |
   |---|---|---|
   | **Admin** | `admin@university.edu` | `AdminPassword123!` |
   | **Lecturer** | `alan.smith@university.edu` | `LecturerPassword123!` |
   | **Lecturer** | `sarah.connor@university.edu` | `LecturerPassword123!` |
   | **Student** | `alice.student@university.edu` | `StudentPassword123!` |
   | **Student** | `bob.student@university.edu` | `StudentPassword123!` |

4. **Start Development Server**:
   ```powershell
   uvicorn main:app --reload
   ```
   - Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

5. **Run Automated Tests**:
   ```powershell
   pytest tests/ -v
   ```
