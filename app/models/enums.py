import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"


class FeedbackSourceType(str, enum.Enum):
    COURSE_EVALUATION = "course_evaluation"
    SURVEY = "survey"
    SERVICE_REVIEW = "service_review"


class SentimentLabel(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    DONE = "done"
    FAILED = "failed"


class EntityType(str, enum.Enum):
    COURSE = "course"
    SERVICE = "service"
    DEPARTMENT = "department"


class ReportType(str, enum.Enum):
    PDF = "pdf"
    EXCEL = "excel"
