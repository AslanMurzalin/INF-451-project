import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.models.department import Department
from app.models.course import Course
from app.models.service import Service
from app.models.survey import Survey
from main import app

# Test database setup (in-memory SQLite with StaticPool)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_department(db_session: Session) -> Department:
    dept = Department(name="Computer Science Test Dept")
    db_session.add(dept)
    db_session.commit()
    db_session.refresh(dept)
    return dept


@pytest.fixture
def admin_user(db_session: Session, test_department: Department) -> User:
    user = User(
        full_name="Admin Tester",
        email="test_admin@university.edu",
        password_hash=hash_password("AdminPass123!"),
        role=UserRole.ADMIN,
        department_id=test_department.department_id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def lecturer_user(db_session: Session, test_department: Department) -> User:
    user = User(
        full_name="Lecturer Tester",
        email="test_lecturer@university.edu",
        password_hash=hash_password("LecturerPass123!"),
        role=UserRole.LECTURER,
        department_id=test_department.department_id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def student_user(db_session: Session, test_department: Department) -> User:
    user = User(
        full_name="Student Tester",
        email="test_student@university.edu",
        password_hash=hash_password("StudentPass123!"),
        role=UserRole.STUDENT,
        department_id=test_department.department_id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_headers(admin_user: User) -> dict:
    token = create_access_token(subject=admin_user.user_id, role=admin_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lecturer_headers(lecturer_user: User) -> dict:
    token = create_access_token(subject=lecturer_user.user_id, role=lecturer_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def student_headers(student_user: User) -> dict:
    token = create_access_token(subject=student_user.user_id, role=student_user.role.value)
    return {"Authorization": f"Bearer {token}"}
