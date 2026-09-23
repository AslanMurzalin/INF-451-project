from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


class CRUDService:
    def get_by_id(self, db: Session, service_id: int) -> Optional[Service]:
        return db.query(Service).filter(Service.service_id == service_id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Service]:
        return db.query(Service).filter(Service.name.ilike(name)).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None
    ) -> List[Service]:
        query = db.query(Service)
        if category:
            query = query.filter(Service.category.ilike(f"%{category}%"))
        return query.offset(skip).limit(limit).all()

    def count(self, db: Session, category: Optional[str] = None) -> int:
        query = db.query(Service)
        if category:
            query = query.filter(Service.category.ilike(f"%{category}%"))
        return query.count()

    def get_categories(self, db: Session) -> List[str]:
        results = db.query(distinct(Service.category)).all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, obj_in: ServiceCreate) -> Service:
        db_service = Service(
            name=obj_in.name,
            category=obj_in.category
        )
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service

    def update(self, db: Session, db_service: Service, obj_in: ServiceUpdate) -> Service:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_service, field, value)
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service

    def delete(self, db: Session, service_id: int) -> Optional[Service]:
        service = self.get_by_id(db, service_id)
        if service:
            db.delete(service)
            db.commit()
        return service


service_crud = CRUDService()
