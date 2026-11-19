from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.topic import Topic, FeedbackTopic
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis
from app.models.enums import SentimentLabel, AnalysisStatus
from app.schemas.topic import (
    TopicItem,
    TopicListResponse,
    TopicFeedbackItem,
    TopicDetailResponse,
)
from app.services.topic_detector import topic_detector


class CRUDTopic:
    def assign_topics_to_feedback(self, db: Session, feedback_id: int) -> List[FeedbackTopic]:
        """
        Runs AI topic detector on a feedback entry and links detected topics.
        """
        feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
        if not feedback or not feedback.raw_text:
            return []

        detected = topic_detector.detect_topics(feedback.raw_text)
        created_links: List[FeedbackTopic] = []

        for name, score in detected:
            topic = db.query(Topic).filter(Topic.name == name).first()
            if not topic:
                topic = Topic(name=name)
                db.add(topic)
                db.flush()

            link = (
                db.query(FeedbackTopic)
                .filter(FeedbackTopic.feedback_id == feedback_id, FeedbackTopic.topic_id == topic.topic_id)
                .first()
            )
            if not link:
                link = FeedbackTopic(
                    feedback_id=feedback_id,
                    topic_id=topic.topic_id,
                    relevance_score=score
                )
                db.add(link)
                created_links.append(link)
            else:
                link.relevance_score = score

        db.commit()
        return created_links

    def get_recurring_topics(self, db: Session, min_count: int = 2) -> TopicListResponse:
        """
        US5.1: Retrieve recurring topics detected by AI.
        Constraint: A topic is shown only if it appears in more than one entry (count >= min_count, default 2).
        """
        topics = db.query(Topic).options(
            joinedload(Topic.feedback_topics).joinedload(FeedbackTopic.feedback).joinedload(Feedback.analysis)
        ).all()

        items: List[TopicItem] = []
        total_tagged_entries = 0

        for t in topics:
            ft_list = t.feedback_topics or []
            count = len(ft_list)
            # US5.1 Constraint: Only shown if it appears in more than one entry!
            if count < min_count:
                continue

            total_tagged_entries += count

            pos_count = 0
            neu_count = 0
            neg_count = 0
            scores = []

            for ft in ft_list:
                scores.append(ft.relevance_score)
                fb = ft.feedback
                if fb and fb.analysis:
                    label = fb.analysis.sentiment_label
                    if label == SentimentLabel.POSITIVE:
                        pos_count += 1
                    elif label == SentimentLabel.NEUTRAL:
                        neu_count += 1
                    elif label == SentimentLabel.NEGATIVE:
                        neg_count += 1

            if neg_count > pos_count and neg_count >= neu_count:
                predom = "negative"
            elif pos_count > neg_count and pos_count >= neu_count:
                predom = "positive"
            else:
                predom = "neutral"

            avg_score = round(sum(scores) / len(scores), 2) if scores else 1.0

            items.append(
                TopicItem(
                    topic_id=t.topic_id,
                    name=t.name,
                    entry_count=count,
                    relevance_score=avg_score,
                    positive_count=pos_count,
                    neutral_count=neu_count,
                    negative_count=neg_count,
                    predominant_sentiment=predom
                )
            )

        # Sort topics by entry count descending
        items.sort(key=lambda x: x.entry_count, reverse=True)

        return TopicListResponse(
            total_topics=len(items),
            total_entries_tagged=total_tagged_entries,
            items=items
        )

    def get_topic_detail(self, db: Session, topic_id: int) -> Optional[TopicDetailResponse]:
        """
        US5.1: Retrieve a topic and its associated feedback entries for drill-down.
        """
        topic = (
            db.query(Topic)
            .options(
                joinedload(Topic.feedback_topics)
                .joinedload(FeedbackTopic.feedback)
                .joinedload(Feedback.course),
                joinedload(Topic.feedback_topics)
                .joinedload(FeedbackTopic.feedback)
                .joinedload(Feedback.service),
                joinedload(Topic.feedback_topics)
                .joinedload(FeedbackTopic.feedback)
                .joinedload(Feedback.survey),
                joinedload(Topic.feedback_topics)
                .joinedload(FeedbackTopic.feedback)
                .joinedload(Feedback.analysis),
            )
            .filter(Topic.topic_id == topic_id)
            .first()
        )
        if not topic:
            return None

        feedback_items: List[TopicFeedbackItem] = []
        for ft in topic.feedback_topics or []:
            fb = ft.feedback
            if not fb:
                continue

            target_name = None
            if fb.course:
                target_name = fb.course.title
            elif fb.service:
                target_name = fb.service.name
            elif fb.survey:
                target_name = fb.survey.title

            label = fb.analysis.sentiment_label if fb.analysis else None
            score = fb.analysis.sentiment_score if fb.analysis else None

            feedback_items.append(
                TopicFeedbackItem(
                    feedback_id=fb.feedback_id,
                    raw_text=fb.raw_text,
                    rating=fb.rating,
                    source_type=fb.source_type,
                    submitted_at=fb.submitted_at,
                    is_anonymous=fb.is_anonymous,
                    relevance_score=ft.relevance_score,
                    sentiment_label=label,
                    sentiment_score=score,
                    target_name=target_name
                )
            )

        # Sort feedbacks by newest first
        feedback_items.sort(key=lambda x: x.submitted_at, reverse=True)

        return TopicDetailResponse(
            topic_id=topic.topic_id,
            name=topic.name,
            entry_count=len(feedback_items),
            feedbacks=feedback_items
        )

    def reindex_all_topics(self, db: Session) -> int:
        """
        Re-indexes all feedbacks in the database and assigns topics.
        """
        feedbacks = db.query(Feedback).all()
        count = 0
        for fb in feedbacks:
            self.assign_topics_to_feedback(db, fb.feedback_id)
            count += 1
        return count


topic_crud = CRUDTopic()
