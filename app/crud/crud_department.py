from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.user import User
from app.models.course import Course
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentDetailResponse


class CRUDDepartment:
    def get_by_id(self, db: Session, department_id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.department_id == department_id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Department]:
        return db.query(Department).filter(Department.name.ilike(name)).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        return db.query(Department).offset(skip).limit(limit).all()

    def count(self, db: Session) -> int:
        return db.query(Department).count()

    def get_detail(self, db: Session, department: Department) -> DepartmentDetailResponse:
        user_count = db.query(User).filter(User.department_id == department.department_id).count()
        course_count = db.query(Course).filter(Course.department_id == department.department_id).count()
        return DepartmentDetailResponse(
            department_id=department.department_id,
            name=department.name,
            user_count=user_count,
            course_count=course_count
        )

    def create(self, db: Session, obj_in: DepartmentCreate) -> Department:
        db_dept = Department(name=obj_in.name)
        db.add(db_dept)
        db.commit()
        db.refresh(db_dept)
        return db_dept

    def update(self, db: Session, db_dept: Department, obj_in: DepartmentUpdate) -> Department:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_dept, field, value)
        db.add(db_dept)
        db.commit()
        db.refresh(db_dept)
        return db_dept

    def delete(self, db: Session, department_id: int) -> Optional[Department]:
        dept = self.get_by_id(db, department_id)
        if dept:
            db.delete(dept)
            db.commit()
        return dept


department_crud = CRUDDepartment()
