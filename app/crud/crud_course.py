from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, CourseDetailResponse


class CRUDCourse:
    def get_by_id(self, db: Session, course_id: int) -> Optional[Course]:
        return db.query(Course).filter(Course.course_id == course_id).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        department_id: Optional[int] = None,
        lecturer_id: Optional[int] = None
    ) -> List[Course]:
        query = db.query(Course)
        if department_id:
            query = query.filter(Course.department_id == department_id)
        if lecturer_id:
            query = query.filter(Course.lecturer_id == lecturer_id)
        return query.offset(skip).limit(limit).all()

    def count(
        self,
        db: Session,
        department_id: Optional[int] = None,
        lecturer_id: Optional[int] = None
    ) -> int:
        query = db.query(Course)
        if department_id:
            query = query.filter(Course.department_id == department_id)
        if lecturer_id:
            query = query.filter(Course.lecturer_id == lecturer_id)
        return query.count()

    def create(self, db: Session, obj_in: CourseCreate) -> Course:
        db_course = Course(
            title=obj_in.title,
            lecturer_id=obj_in.lecturer_id,
            department_id=obj_in.department_id
        )
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course

    def update(self, db: Session, db_course: Course, obj_in: CourseUpdate) -> Course:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_course, field, value)
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course

    def delete(self, db: Session, course_id: int) -> Optional[Course]:
        course = self.get_by_id(db, course_id)
        if course:
            db.delete(course)
            db.commit()
        return course

    def to_detail(self, course: Course) -> CourseDetailResponse:
        return CourseDetailResponse(
            course_id=course.course_id,
            title=course.title,
            lecturer_id=course.lecturer_id,
            department_id=course.department_id,
            lecturer_name=course.lecturer.full_name if course.lecturer else None,
            department_name=course.department.name if course.department else None
        )


course_crud = CRUDCourse()
