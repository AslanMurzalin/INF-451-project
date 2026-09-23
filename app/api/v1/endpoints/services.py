from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.crud.crud_service import service_crud
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ServiceResponse])
def list_services(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.3: List campus services, with optional category filtering (e.g. IT support, cafeteria, library).
    """
    skip = (page - 1) * page_size
    services = service_crud.get_multi(db, skip=skip, limit=page_size, category=category)
    total = service_crud.count(db, category=category)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse[ServiceResponse](
        items=services,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/categories", response_model=List[str])
def list_service_categories(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.3: List all distinct campus service categories currently configured.
    """
    return service_crud.get_categories(db)


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin creates a new campus service feedback target.
    """
    existing = service_crud.get_by_name(db, name=service_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A campus service with this name already exists."
        )
    return service_crud.create(db, obj_in=service_in)


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    US1.3: Get campus service details by ID.
    """
    service = service_crud.get_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin updates service name or category.
    """
    service = service_crud.get_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )

    if service_in.name and service_in.name.lower() != service.name.lower():
        existing = service_crud.get_by_name(db, name=service_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A campus service with this name already exists."
            )

    return service_crud.update(db, db_service=service, obj_in=service_in)


@router.delete("/{service_id}", response_model=MessageResponse)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    US1.3: Admin deletes a campus service.
    """
    deleted_service = service_crud.delete(db, service_id=service_id)
    if not deleted_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )
    return MessageResponse(message=f"Service {service_id} deleted successfully.")
