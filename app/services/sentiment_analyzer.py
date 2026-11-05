import re
from typing import Tuple, Optional
from app.models.enums import SentimentLabel


POSITIVE_WORDS = {
    "excellent", "great", "outstanding", "superb", "clear", "helpful", "amazing",
    "good", "love", "loved", "best", "effective", "enjoyed", "enjoyable", "insightful",
    "fascinating", "high", "top-notch", "exceptional", "friendly", "prompt", "smooth",
    "fast", "organized", "recommended", "positive", "appreciate", "appreciated",
    "structured", "engaging", "accessible", "valuable", "satisfying", "satisfied"
}

NEGATIVE_WORDS = {
    "terrible", "horrible", "awful", "bad", "poor", "worst", "slow", "broken",
    "delay", "delays", "delayed", "confused", "confusing", "unclear", "difficult",
    "hard", "useless", "frustrating", "frustrated", "rude", "buggy", "dirty",
    "boring", "disorganized", "fail", "failed", "unhelpful", "noisy", "crowded",
    "disappointing", "disappointed", "negative", "waste", "unfair", "inconsistent"
}

NEGATION_WORDS = {"not", "never", "no", "hardly", "barely", "scarcely", "without", "rarely"}


class SentimentAnalyzer:
    """
    Rule-based & heuristic AI sentiment analyzer for student feedback text and ratings.
    Classifies feedback into POSITIVE, NEUTRAL, or NEGATIVE, with a confidence score.
    """

    def analyze(self, text: str, rating: Optional[int] = None) -> Tuple[SentimentLabel, float]:
        if not text:
            if rating is not None:
                if rating >= 4:
                    return SentimentLabel.POSITIVE, 0.85
                elif rating <= 2:
                    return SentimentLabel.NEGATIVE, 0.85
                else:
                    return SentimentLabel.NEUTRAL, 0.70
            return SentimentLabel.NEUTRAL, 0.50

        words = re.findall(r"\b[a-zA-Z\-']+\b", text.lower())
        pos_score = 0.0
        neg_score = 0.0

        i = 0
        while i < len(words):
            word = words[i]
            is_negated = False
            # Check 1-2 words preceding for negation
            if i > 0 and words[i - 1] in NEGATION_WORDS:
                is_negated = True
            elif i > 1 and words[i - 2] in NEGATION_WORDS:
                is_negated = True

            if word in POSITIVE_WORDS:
                if is_negated:
                    neg_score += 1.2
                else:
                    pos_score += 1.0
            elif word in NEGATIVE_WORDS:
                if is_negated:
                    pos_score += 0.8
                else:
                    neg_score += 1.0
            i += 1

        # Integrate rating influence if available
        if rating is not None:
            if rating >= 4:
                pos_score += (rating - 3) * 0.8
            elif rating <= 2:
                neg_score += (3 - rating) * 0.8

        total = pos_score + neg_score

        if total == 0:
            return SentimentLabel.NEUTRAL, 0.60

        diff = pos_score - neg_score
        if diff > 0.3:
            # Positive
            confidence = min(0.99, max(0.65, 0.5 + (diff / (total + 1.0)) * 0.5))
            return SentimentLabel.POSITIVE, round(confidence, 2)
        elif diff < -0.3:
            # Negative
            confidence = min(0.99, max(0.65, 0.5 + (abs(diff) / (total + 1.0)) * 0.5))
            return SentimentLabel.NEGATIVE, round(confidence, 2)
        else:
            confidence = min(0.85, max(0.55, 1.0 - (abs(diff) / (total + 1.0))))
            return SentimentLabel.NEUTRAL, round(confidence, 2)


sentiment_analyzer = SentimentAnalyzer()

