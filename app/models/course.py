from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    lecturer_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    lecturer = relationship("User", back_populates="taught_courses", foreign_keys=[lecturer_id])
    department = relationship("Department", back_populates="courses")
    feedbacks = relationship("Feedback", back_populates="course", cascade="all, delete-orphan")
