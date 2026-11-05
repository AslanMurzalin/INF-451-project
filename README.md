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


---

## Sprint 4 — Sentiment Analysis

### Features Implemented
- **US4.1 — Automatic Sentiment Scoring**:
  - Rule-based & heuristic AI sentiment analysis engine (`app/services/sentiment_analyzer.py`) evaluating text content and ratings.
  - Automatic classification into `POSITIVE`, `NEUTRAL`, or `NEGATIVE` with confidence scoring (0.0 – 1.0).
  - Non-blocking submission: feedback submissions store an initial `PENDING` analysis status (`"Sentiment pending"`) so student submission is never blocked, followed by automatic asynchronous scoring.
  - Sentiment badges displayed next to each entry in feedback repository lists for lecturers and administrators with confidence metrics.
  - Filter by sentiment status (`POSITIVE`, `NEUTRAL`, `NEGATIVE`, `PENDING`) in the moderation repository.

- **US4.2 — Sentiment Breakdown by Category**:
  - Aggregation endpoint `GET /api/v1/analytics/sentiment-breakdown?category_type={course|service|survey}` protected by Admin role check (`require_admin`).
  - Interactive Admin Sentiment Breakdown page (`/admin/sentiment-breakdown`) featuring category switch tabs (`Courses`, `Campus Services`, `Ad-hoc Surveys`).
  - Stacked sentiment distribution charts showing positive, neutral, and negative shares side-by-side.
  - Comprehensive satisfaction benchmark matrix table with health status indicators (`EXCELLENT`, `SATISFACTORY`, `ATTENTION NEEDED`).
  - Strict calculation rule: Percentages are calculated only from entries with completed sentiment scoring (pending submissions are excluded from percentage denominator).
  - Category empty-state handling: Items with no feedback data display a `"No data"` badge without percentages or errors.

### Sprint 4 Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/feedbacks` | Submit student/staff feedback & trigger AI sentiment scoring | Authenticated |
| `GET` | `/api/v1/feedbacks` | List feedback entries with sentiment labels and filter parameters | Lecturer, Admin |
| `GET` | `/api/v1/feedbacks/{id}` | Retrieve single feedback entry with detailed AI analysis | Authenticated |
| `POST` | `/api/v1/feedbacks/{id}/analyze` | Trigger or re-run AI sentiment scoring | Lecturer, Admin |
| `GET` | `/api/v1/analytics/sentiment-breakdown` | Category sentiment breakdown and satisfaction percentages | Admin Only |
