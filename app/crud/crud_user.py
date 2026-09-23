from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


class CRUDUser:
    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.user_id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        role: Optional[UserRole] = None,
        department_id: Optional[int] = None
    ) -> List[User]:
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        if department_id:
            query = query.filter(User.department_id == department_id)
        return query.offset(skip).limit(limit).all()

    def count(
        self,
        db: Session,
        role: Optional[UserRole] = None,
        department_id: Optional[int] = None
    ) -> int:
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        if department_id:
            query = query.filter(User.department_id == department_id)
        return query.count()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_user = User(
            full_name=obj_in.full_name,
            email=obj_in.email.lower(),
            password_hash=hash_password(obj_in.password),
            role=obj_in.role,
            department_id=obj_in.department_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update(self, db: Session, db_user: User, obj_in: UserUpdate) -> User:
        update_data = obj_in.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            db_user.password_hash = hash_password(update_data.pop("password"))
        if "email" in update_data and update_data["email"]:
            db_user.email = update_data.pop("email").lower()
            
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def delete(self, db: Session, user_id: int) -> Optional[User]:
        user = self.get_by_id(db, user_id)
        if user:
            db.delete(user)
            db.commit()
        return user

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user


user_crud = CRUDUser()
