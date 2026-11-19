import re
from typing import List, Tuple, Dict

# Canonical topic taxonomy with primary and secondary keyword patterns
TOPIC_RULES: Dict[str, Dict[str, any]] = {
    "Grading Delays": {
        "keywords": ["grade", "grades", "grading", "delay", "delays", "delayed", "late", "wait", "waiting", "score", "scores", "marked", "marking"],
        "required_pairs": [
            ("grade", "delay"), ("grades", "delay"), ("grading", "delay"),
            ("grade", "late"), ("grades", "late"), ("grading", "late"),
            ("assignment", "late"), ("delayed", "feedback"), ("late", "feedback"),
            ("delay", "results"), ("late", "grades"), ("late", "grading")
        ],
        "single_strong": ["grading delays", "late grading", "delayed grading", "late grades"]
    },
    "Cafeteria Hygiene & Food Quality": {
        "keywords": ["cafeteria", "food", "meal", "meals", "hygiene", "dining", "cleanliness", "dirty", "canteen", "lunch", "dinner", "snack"],
        "required_pairs": [
            ("cafeteria", "food"), ("cafeteria", "hygiene"), ("food", "hygiene"),
            ("food", "quality"), ("dining", "hall"), ("meal", "selection"),
            ("cafeteria", "dirty"), ("cafeteria", "clean")
        ],
        "single_strong": ["cafeteria hygiene", "dining hall", "food quality", "cafeteria food"]
    },
    "Teaching Quality & Lecture Clarity": {
        "keywords": ["lecture", "lectures", "explanation", "explanations", "explain", "explains", "teaching", "clarity", "clear", "pacing", "professor", "lecturer"],
        "required_pairs": [
            ("lecture", "clear"), ("explain", "clarity"), ("teaching", "quality"),
            ("lecture", "pacing"), ("professor", "explains"), ("lecturer", "explains")
        ],
        "single_strong": ["teaching quality", "lecture clarity", "clear explanations"]
    },
    "Practical Labs & Hands-on Exercises": {
        "keywords": ["lab", "labs", "practical", "exercise", "exercises", "hands-on", "coding", "experiment", "experiments", "equipment", "hardware"],
        "required_pairs": [
            ("practical", "labs"), ("hands-on", "labs"), ("lab", "exercises"),
            ("lab", "equipment"), ("practical", "exercises")
        ],
        "single_strong": ["practical labs", "hands-on", "lab exercises", "lab equipment"]
    },
    "Campus Wi-Fi & IT Support": {
        "keywords": ["wifi", "wi-fi", "internet", "network", "portal", "login", "credentials", "helpdesk", "connection", "it support"],
        "required_pairs": [
            ("wifi", "speed"), ("wifi", "connection"), ("portal", "login"),
            ("reset", "credentials"), ("it", "helpdesk"), ("network", "slow")
        ],
        "single_strong": ["it support", "it helpdesk", "campus wi-fi", "wi-fi"]
    },
    "Course Materials & Syllabus": {
        "keywords": ["syllabus", "slides", "notes", "materials", "textbook", "readings", "resources", "curriculum", "structure"],
        "required_pairs": [
            ("course", "materials"), ("course", "structure"), ("lecture", "slides"),
            ("reading", "materials"), ("updated", "syllabus")
        ],
        "single_strong": ["course materials", "course structure", "lecture notes"]
    },
    "Library & Study Spaces": {
        "keywords": ["library", "study", "space", "spaces", "quiet", "books", "room", "rooms", "desks", "facilities"],
        "required_pairs": [
            ("study", "spaces"), ("library", "quiet"), ("study", "rooms"),
            ("evening", "study"), ("library", "desks")
        ],
        "single_strong": ["study spaces", "quiet study", "campus library", "library"]
    },
    "Assignment Workload & Deadlines": {
        "keywords": ["workload", "deadline", "deadlines", "assignment", "assignments", "homework", "heavy", "overwhelming", "pressure", "schedule"],
        "required_pairs": [
            ("assignment", "deadline"), ("heavy", "workload"), ("tight", "deadlines"),
            ("workload", "heavy"), ("multiple", "deadlines")
        ],
        "single_strong": ["heavy workload", "tight deadlines", "assignment deadlines"]
    }
}


class TopicDetector:
    """
    Automated AI Topic Detection engine for student feedback.
    Identifies recurring themes, issues, and strengths from text.
    """

    def detect_topics(self, text: str) -> List[Tuple[str, float]]:
        """
        Detects topics from raw feedback text.
        Returns a list of (topic_name, relevance_score) where score is between 0.0 and 1.0.
        """
        if not text or len(text.strip()) == 0:
            return []

        clean_text = text.lower()
        words = set(re.findall(r"\b[a-z0-9\-']+\b", clean_text))

        detected: List[Tuple[str, float]] = []

        for topic_name, rule in TOPIC_RULES.items():
            matched_score = 0.0

            # 1. Check strong single phrases (exact substring match)
            for phrase in rule.get("single_strong", []):
                if phrase in clean_text:
                    matched_score = max(matched_score, 0.95)

            # 2. Check required keyword pairs (both words appear in text)
            for w1, w2 in rule.get("required_pairs", []):
                if w1 in clean_text and w2 in clean_text:
                    matched_score = max(matched_score, 0.85)

            # 3. Check general keyword overlap
            matched_keywords = [k for k in rule.get("keywords", []) if k in words or k in clean_text]
            if len(matched_keywords) >= 3:
                matched_score = max(matched_score, 0.75)
            elif len(matched_keywords) >= 2:
                matched_score = max(matched_score, 0.60)
            elif len(matched_keywords) == 1 and matched_score == 0:
                # Weak single match, only accepted if keyword is very specific
                if matched_keywords[0] in ["grading", "cafeteria", "wifi", "wi-fi", "syllabus"]:
                    matched_score = max(matched_score, 0.55)

            if matched_score >= 0.55:
                detected.append((topic_name, round(matched_score, 2)))

        # Fallback: if no predefined topic matched, check for specific phrases
        if not detected:
            if "grade" in clean_text or "grading" in clean_text or "late" in clean_text:
                detected.append(("Grading Delays", 0.70))
            elif "food" in clean_text or "cafeteria" in clean_text:
                detected.append(("Cafeteria Hygiene & Food Quality", 0.70))
            elif "lecture" in clean_text or "teach" in clean_text or "professor" in clean_text:
                detected.append(("Teaching Quality & Lecture Clarity", 0.65))

        # Sort by relevance score descending
        detected.sort(key=lambda x: x[1], reverse=True)
        return detected


topic_detector = TopicDetector()
