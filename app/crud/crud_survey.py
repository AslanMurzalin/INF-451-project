from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.survey import Survey
from app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyResponse


class CRUDSurvey:
    def get_by_id(self, db: Session, survey_id: int) -> Optional[Survey]:
        return db.query(Survey).filter(Survey.survey_id == survey_id).first()

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None  # "active", "upcoming", "past"
    ) -> List[Survey]:
        query = db.query(Survey)
        now = datetime.now(timezone.utc)

        if status == "active":
            query = query.filter(Survey.start_date <= now, Survey.end_date >= now)
        elif status == "upcoming":
            query = query.filter(Survey.start_date > now)
        elif status == "past":
            query = query.filter(Survey.end_date < now)

        return query.order_by(Survey.start_date.desc()).offset(skip).limit(limit).all()

    def count(self, db: Session, status: Optional[str] = None) -> int:
        query = db.query(Survey)
        now = datetime.now(timezone.utc)

        if status == "active":
            query = query.filter(Survey.start_date <= now, Survey.end_date >= now)
        elif status == "upcoming":
            query = query.filter(Survey.start_date > now)
        elif status == "past":
            query = query.filter(Survey.end_date < now)

        return query.count()

    def create(self, db: Session, obj_in: SurveyCreate, user_id: Optional[int] = None) -> Survey:
        db_survey = Survey(
            title=obj_in.title,
            start_date=obj_in.start_date,
            end_date=obj_in.end_date,
            created_by=user_id
        )
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        return db_survey

    def update(self, db: Session, db_survey: Survey, obj_in: SurveyUpdate) -> Survey:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_survey, field, value)
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        return db_survey

    def delete(self, db: Session, survey_id: int) -> Optional[Survey]:
        survey = self.get_by_id(db, survey_id)
        if survey:
            db.delete(survey)
            db.commit()
        return survey

    def to_response(self, survey: Survey) -> SurveyResponse:
        now = datetime.now(timezone.utc)
        # Ensure start_date / end_date are timezone-aware if sqlite returned naive
        s_date = survey.start_date if survey.start_date.tzinfo else survey.start_date.replace(tzinfo=timezone.utc)
        e_date = survey.end_date if survey.end_date.tzinfo else survey.end_date.replace(tzinfo=timezone.utc)
        is_active = (s_date <= now <= e_date)
        return SurveyResponse(
            survey_id=survey.survey_id,
            title=survey.title,
            start_date=s_date,
            end_date=e_date,
            created_by=survey.created_by,
            creator_name=survey.creator.full_name if survey.creator else None,
            is_active=is_active
        )


survey_crud = CRUDSurvey()
