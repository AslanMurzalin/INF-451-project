from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="SET NULL"), nullable=True)

    # Relationships
    department = relationship("Department", back_populates="users")
    taught_courses = relationship("Course", back_populates="lecturer", foreign_keys="Course.lecturer_id")
    feedbacks = relationship("Feedback", back_populates="user")
    created_surveys = relationship("Survey", back_populates="creator")
    alerts = relationship("Alert", back_populates="admin")
    reports = relationship("Report", back_populates="author")
