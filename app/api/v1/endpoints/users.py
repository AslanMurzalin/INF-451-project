from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.crud.crud_user import user_crud
from app.crud.crud_department import department_crud
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[UserResponse])
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: List all users with optional filtering by role and department.
    """
    skip = (page - 1) * page_size
    users = user_crud.get_multi(
        db, skip=skip, limit=page_size, role=role, department_id=department_id
    )
    total = user_crud.count(db, role=role, department_id=department_id)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse[UserResponse](
        items=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: Create a new user with specific role and department.
    """
    existing_user = user_crud.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    if user_in.department_id:
        dept = department_crud.get_by_id(db, department_id=user_in.department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id {user_in.department_id} not found."
            )

    return user_crud.create(db, obj_in=user_in)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user by ID. Accessible by Admins or the user themselves.
    """
    if current_user.role != UserRole.ADMIN and current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: cannot view other users' data."
        )

    user = user_crud.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Admin: Update any user account.
    """
    user = user_crud.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user_in.email and user_in.email.lower() != user.email:
        existing_user = user_crud.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already taken by another account."
            )

    if user_in.department_id:
        dept = department_crud.get_by_id(db, department_id=user_in.department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id {user_in.department_id} not found."
            )

    return user_crud.update(db, db_user=user, obj_in=user_in)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin: Delete a user account.
    """
    if current_user.user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete their own account."
        )

    deleted_user = user_crud.delete(db, user_id=user_id)
    if not deleted_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return MessageResponse(message=f"User {user_id} deleted successfully.")
