from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.crud.crud_department import department_crud
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentDetailResponse,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=List[DepartmentResponse])
def list_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    List all university departments.
    """
    return department_crud.get_multi(db, skip=skip, limit=limit)


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: Create a new academic or operational department.
    """
    existing = department_crud.get_by_name(db, name=dept_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name already exists."
        )
    return department_crud.create(db, obj_in=dept_in)


@router.get("/{department_id}", response_model=DepartmentDetailResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get detailed information about a department including course and user counts.
    """
    dept = department_crud.get_by_id(db, department_id=department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )
    return department_crud.get_detail(db, department=dept)


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: Update department name.
    """
    dept = department_crud.get_by_id(db, department_id=department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )

    if dept_in.name and dept_in.name.lower() != dept.name.lower():
        existing = department_crud.get_by_name(db, name=dept_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department with this name already exists."
            )

    return department_crud.update(db, db_dept=dept, obj_in=dept_in)


@router.delete("/{department_id}", response_model=MessageResponse)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: Delete a department.
    """
    deleted_dept = department_crud.delete(db, department_id=department_id)
    if not deleted_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )
    return MessageResponse(message=f"Department {department_id} deleted successfully.")
