from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis
from app.models.course import Course
from app.models.service import Service
from app.models.survey import Survey
from app.models.department import Department
from app.models.enums import FeedbackSourceType, SentimentLabel, AnalysisStatus
from app.schemas.sentiment import (
    FeedbackCreate,
    SentimentCategoryItem,
    SentimentBreakdownResponse,
)
from app.services.sentiment_analyzer import sentiment_analyzer


class CRUDFeedback:
    def create_feedback(
        self,
        db: Session,
        obj_in: FeedbackCreate,
        user_id: Optional[int] = None,
        auto_analyze: bool = True
    ) -> Feedback:
        feedback = Feedback(
            user_id=user_id if not obj_in.is_anonymous else None,
            source_type=obj_in.source_type,
            course_id=obj_in.course_id,
            service_id=obj_in.service_id,
            survey_id=obj_in.survey_id,
            raw_text=obj_in.raw_text,
            rating=obj_in.rating,
            is_anonymous=obj_in.is_anonymous,
            submitted_at=datetime.now(timezone.utc),
        )
        db.add(feedback)
        db.flush()

        # Create AI Analysis entry in PENDING status
        analysis = AIAnalysis(
            feedback_id=feedback.feedback_id,
            status=AnalysisStatus.PENDING,
            processed_at=datetime.now(timezone.utc),
        )
        db.add(analysis)
        db.commit()
        db.refresh(feedback)

        # Trigger AI scoring
        if auto_analyze:
            self.process_sentiment_analysis(db, feedback.feedback_id)
            db.refresh(feedback)

        return feedback

    def process_sentiment_analysis(self, db: Session, feedback_id: int) -> Optional[AIAnalysis]:
        feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
        if not feedback:
            return None

        analysis = db.query(AIAnalysis).filter(AIAnalysis.feedback_id == feedback_id).first()
        if not analysis:
            analysis = AIAnalysis(feedback_id=feedback_id)
            db.add(analysis)

        try:
            label, score = sentiment_analyzer.analyze(feedback.raw_text, feedback.rating)
            analysis.sentiment_label = label
            analysis.sentiment_score = score
            analysis.status = AnalysisStatus.DONE
            analysis.processed_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(analysis)
            return analysis
        except Exception:
            db.rollback()
            analysis.status = AnalysisStatus.FAILED
            db.commit()
            return analysis

    def get_by_id(self, db: Session, feedback_id: int) -> Optional[Feedback]:
        return (
            db.query(Feedback)
            .options(
                joinedload(Feedback.analysis),
                joinedload(Feedback.course),
                joinedload(Feedback.service),
                joinedload(Feedback.survey),
            )
            .filter(Feedback.feedback_id == feedback_id)
            .first()
        )

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        source_type: Optional[FeedbackSourceType] = None,
        course_id: Optional[int] = None,
        service_id: Optional[int] = None,
        survey_id: Optional[int] = None,
        sentiment_label: Optional[SentimentLabel] = None,
        status: Optional[AnalysisStatus] = None,
    ) -> List[Feedback]:
        query = db.query(Feedback).options(
            joinedload(Feedback.analysis),
            joinedload(Feedback.course),
            joinedload(Feedback.service),
            joinedload(Feedback.survey),
        )
        if source_type:
            query = query.filter(Feedback.source_type == source_type)
        if course_id:
            query = query.filter(Feedback.course_id == course_id)
        if service_id:
            query = query.filter(Feedback.service_id == service_id)
        if survey_id:
            query = query.filter(Feedback.survey_id == survey_id)
        if sentiment_label:
            query = query.join(Feedback.analysis).filter(AIAnalysis.sentiment_label == sentiment_label)
        if status:
            query = query.join(Feedback.analysis).filter(AIAnalysis.status == status)

        return query.order_by(Feedback.feedback_id.desc()).offset(skip).limit(limit).all()

    def get_sentiment_breakdown(
        self,
        db: Session,
        category_type: str = "course"
    ) -> SentimentBreakdownResponse:
        norm_type = category_type.lower()
        items: List[SentimentCategoryItem] = []

        total_feedbacks_all = 0
        total_analyzed_all = 0
        total_pos_all = 0
        total_neu_all = 0
        total_neg_all = 0

        if norm_type == "course":
            courses = db.query(Course).all()
            for c in courses:
                fbs = db.query(Feedback).filter(Feedback.course_id == c.course_id).all()
                total_fb = len(fbs)
                total_feedbacks_all += total_fb

                pos = 0
                neu = 0
                neg = 0
                analyzed = 0

                for f in fbs:
                    if f.analysis and f.analysis.status == AnalysisStatus.DONE and f.analysis.sentiment_label:
                        analyzed += 1
                        if f.analysis.sentiment_label == SentimentLabel.POSITIVE:
                            pos += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEUTRAL:
                            neu += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEGATIVE:
                            neg += 1

                total_analyzed_all += analyzed
                total_pos_all += pos
                total_neu_all += neu
                total_neg_all += neg

                has_data = analyzed > 0
                dept_name = c.department.name if c.department else None

                items.append(
                    SentimentCategoryItem(
                        id=c.course_id,
                        name=c.title,
                        entity_type="course",
                        department_name=dept_name,
                        total_feedbacks=total_fb,
                        analyzed_feedbacks=analyzed,
                        has_data=has_data,
                        positive_percentage=round((pos / analyzed) * 100.0, 1) if has_data else None,
                        neutral_percentage=round((neu / analyzed) * 100.0, 1) if has_data else None,
                        negative_percentage=round((neg / analyzed) * 100.0, 1) if has_data else None,
                        positive_count=pos,
                        neutral_count=neu,
                        negative_count=neg,
                    )
                )

        elif norm_type == "service":
            services = db.query(Service).all()
            for s in services:
                fbs = db.query(Feedback).filter(Feedback.service_id == s.service_id).all()
                total_fb = len(fbs)
                total_feedbacks_all += total_fb

                pos = 0
                neu = 0
                neg = 0
                analyzed = 0

                for f in fbs:
                    if f.analysis and f.analysis.status == AnalysisStatus.DONE and f.analysis.sentiment_label:
                        analyzed += 1
                        if f.analysis.sentiment_label == SentimentLabel.POSITIVE:
                            pos += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEUTRAL:
                            neu += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEGATIVE:
                            neg += 1

                total_analyzed_all += analyzed
                total_pos_all += pos
                total_neu_all += neu
                total_neg_all += neg

                has_data = analyzed > 0

                items.append(
                    SentimentCategoryItem(
                        id=s.service_id,
                        name=s.name,
                        entity_type="service",
                        department_name=s.category or "Campus Service",
                        total_feedbacks=total_fb,
                        analyzed_feedbacks=analyzed,
                        has_data=has_data,
                        positive_percentage=round((pos / analyzed) * 100.0, 1) if has_data else None,
                        neutral_percentage=round((neu / analyzed) * 100.0, 1) if has_data else None,
                        negative_percentage=round((neg / analyzed) * 100.0, 1) if has_data else None,
                        positive_count=pos,
                        neutral_count=neu,
                        negative_count=neg,
                    )
                )

        elif norm_type == "survey":
            surveys = db.query(Survey).all()
            for sv in surveys:
                fbs = db.query(Feedback).filter(Feedback.survey_id == sv.survey_id).all()
                total_fb = len(fbs)
                total_feedbacks_all += total_fb

                pos = 0
                neu = 0
                neg = 0
                analyzed = 0

                for f in fbs:
                    if f.analysis and f.analysis.status == AnalysisStatus.DONE and f.analysis.sentiment_label:
                        analyzed += 1
                        if f.analysis.sentiment_label == SentimentLabel.POSITIVE:
                            pos += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEUTRAL:
                            neu += 1
                        elif f.analysis.sentiment_label == SentimentLabel.NEGATIVE:
                            neg += 1

                total_analyzed_all += analyzed
                total_pos_all += pos
                total_neu_all += neu
                total_neg_all += neg

                has_data = analyzed > 0

                items.append(
                    SentimentCategoryItem(
                        id=sv.survey_id,
                        name=sv.title,
                        entity_type="survey",
                        department_name="Campus Survey",
                        total_feedbacks=total_fb,
                        analyzed_feedbacks=analyzed,
                        has_data=has_data,
                        positive_percentage=round((pos / analyzed) * 100.0, 1) if has_data else None,
                        neutral_percentage=round((neu / analyzed) * 100.0, 1) if has_data else None,
                        negative_percentage=round((neg / analyzed) * 100.0, 1) if has_data else None,
                        positive_count=pos,
                        neutral_count=neu,
                        negative_count=neg,
                    )
                )

        categories_with_data = sum(1 for it in items if it.has_data)
        overall_pos = round((total_pos_all / total_analyzed_all) * 100.0, 1) if total_analyzed_all > 0 else None
        overall_neu = round((total_neu_all / total_analyzed_all) * 100.0, 1) if total_analyzed_all > 0 else None
        overall_neg = round((total_neg_all / total_analyzed_all) * 100.0, 1) if total_analyzed_all > 0 else None

        return SentimentBreakdownResponse(
            category_type=norm_type,
            total_categories=len(items),
            categories_with_data=categories_with_data,
            total_feedbacks=total_feedbacks_all,
            total_analyzed=total_analyzed_all,
            overall_positive_percentage=overall_pos,
            overall_neutral_percentage=overall_neu,
            overall_negative_percentage=overall_neg,
            items=items,
        )


feedback_crud = CRUDFeedback()

