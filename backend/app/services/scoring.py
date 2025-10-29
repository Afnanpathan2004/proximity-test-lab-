from sqlalchemy.orm import Session
from ..models.response import Response
from ..models.question import Question


def compute_attempt_score(db: Session, attempt_id: int) -> float:
    total_questions = (
        db.query(Question)
        .join(Response, Response.question_id == Question.id)
        .filter(Response.attempt_id == attempt_id)
        .distinct(Question.id)
        .count()
    )
    if total_questions == 0:
        return 0.0
    correct = db.query(Response).filter(Response.attempt_id == attempt_id, Response.correct_bool == True).count()
    return round((correct / total_questions) * 100.0, 2)
