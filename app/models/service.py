from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=False, index=True)  # e.g., "Library", "Cafeteria", "IT Support"

    # Relationships
    feedbacks = relationship("Feedback", back_populates="service", cascade="all, delete-orphan")
