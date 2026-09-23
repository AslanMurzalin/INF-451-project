from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.crud.crud_course import course_crud
from app.crud.crud_department import department_crud
from app.crud.crud_user import user_crud
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseDetailResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CourseDetailResponse])
def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department_id: Optional[int] = None,
    lecturer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.3: List courses, with filtering by department or assigned lecturer.
    """
    skip = (page - 1) * page_size
    courses = course_crud.get_multi(
        db, skip=skip, limit=page_size, department_id=department_id, lecturer_id=lecturer_id
    )
    total = course_crud.count(db, department_id=department_id, lecturer_id=lecturer_id)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    detail_items = [course_crud.to_detail(c) for c in courses]

    return PaginatedResponse[CourseDetailResponse](
        items=detail_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=CourseDetailResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin creates a course and links it to a department and optional lecturer.
    """
    dept = department_crud.get_by_id(db, department_id=course_in.department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with id {course_in.department_id} not found."
        )

    if course_in.lecturer_id:
        lecturer = user_crud.get_by_id(db, user_id=course_in.lecturer_id)
        if not lecturer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lecturer user with id {course_in.lecturer_id} not found."
            )
        if lecturer.role != UserRole.LECTURER and lecturer.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user must have 'lecturer' or 'admin' role."
            )

    course = course_crud.create(db, obj_in=course_in)
    return course_crud.to_detail(course)


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.3: Get detailed course information.
    """
    course = course_crud.get_by_id(db, course_id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found."
        )
    return course_crud.to_detail(course)


@router.put("/{course_id}", response_model=CourseDetailResponse)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin updates course title, department, or assigned lecturer.
    """
    course = course_crud.get_by_id(db, course_id=course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found."
        )

    if course_in.department_id:
        dept = department_crud.get_by_id(db, department_id=course_in.department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id {course_in.department_id} not found."
            )

    if course_in.lecturer_id:
        lecturer = user_crud.get_by_id(db, user_id=course_in.lecturer_id)
        if not lecturer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lecturer user with id {course_in.lecturer_id} not found."
            )

    updated_course = course_crud.update(db, db_course=course, obj_in=course_in)
    return course_crud.to_detail(updated_course)


@router.delete("/{course_id}", response_model=MessageResponse)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin deletes a course.
    """
    deleted_course = course_crud.delete(db, course_id=course_id)
    if not deleted_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found."
        )
    return MessageResponse(message=f"Course {course_id} deleted successfully.")
