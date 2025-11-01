from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..models.attempt import Attempt
from ..models.response import Response
from ..models.question import Question


def compute_attempt_breakdown(db: Session, attempt_id: int) -> Dict[str, Any]:
    a = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not a:
        return {"exists": False}
    total = (
        db.query(Question)
        .join(Response, Response.question_id == Question.id)
        .filter(Response.attempt_id == attempt_id)
        .distinct(Question.id)
        .count()
    )
    correct = db.query(Response).filter(Response.attempt_id == attempt_id, Response.correct_bool == True).count()
    by_topic = (
        db.query(
            Question.topic_tag,
            func.avg(case((Response.correct_bool == True, 1), else_=0).label("correct_int")),
        )
        .join(Response, Response.question_id == Question.id)
        .filter(Response.attempt_id == attempt_id)
        .group_by(Question.topic_tag)
        .all()
    )
    topic_mastery = {t or "": round(float(avg) * 100.0, 2) for t, avg in by_topic}
    return {
        "exists": True,
        "attempt": {"id": a.id, "test_id": a.test_id, "type": a.type, "score": a.score},
        "total": total,
        "correct": correct,
        "topic_mastery": topic_mastery,
    }


def compute_class_metrics(db: Session, test_id: int) -> Dict[str, Any]:
    # averages for pre and post
    pre_scores = [x[0] for x in db.query(Attempt.score).filter(Attempt.test_id == test_id, Attempt.type == "pre", Attempt.score != None).all()]
    post_scores = [x[0] for x in db.query(Attempt.score).filter(Attempt.test_id == test_id, Attempt.type == "post", Attempt.score != None).all()]
    avg_pre = round(sum(pre_scores) / len(pre_scores), 2) if pre_scores else 0.0
    avg_post = round(sum(post_scores) / len(post_scores), 2) if post_scores else 0.0
    improvement = round(avg_post - avg_pre, 2)

    # weak topics: <50% correct on post
    by_topic_post = (
        db.query(
            Question.topic_tag,
            func.avg(case((Response.correct_bool == True, 1), else_=0).label("correct_int")),
        )
        .join(Response, Response.question_id == Question.id)
        .join(Attempt, Attempt.id == Response.attempt_id)
        .filter(Attempt.test_id == test_id, Attempt.type == "post")
        .group_by(Question.topic_tag)
        .all()
    )
    topic_mastery = {t or "": round(float(avg) * 100.0, 2) for t, avg in by_topic_post}
    weak_topics = [t for t, pct in topic_mastery.items() if pct < 50]

    return {
        "avg_pre": avg_pre,
        "avg_post": avg_post,
        "improvement": improvement,
        "topic_mastery": topic_mastery,
        "weak_topics": weak_topics,
    }


def compute_teacher_score(
    delta_avg: float,
    pass_rate_post: float,
    topic_coverage: float,
    engagement: float,
) -> int:
    # Values expected in [0..100]
    score = 0.45 * max(0, min(100, delta_avg)) + 0.25 * pass_rate_post + 0.20 * topic_coverage + 0.10 * engagement
    return int(round(max(0, min(100, score))))


def compute_pass_rate_post(db: Session, test_id: int, pass_threshold: float) -> float:
    rows = db.query(Attempt.score).filter(Attempt.test_id == test_id, Attempt.type == "post", Attempt.score != None).all()
    if not rows:
        return 0.0
    scores = [r[0] for r in rows]
    passed = sum(1 for s in scores if s >= pass_threshold)
    return round(100.0 * passed / len(scores), 2)


def compute_engagement(db: Session, test_id: int, min_answer_ratio: float = 0.6) -> float:
    # engagement = % students who completed tests & answered >= X% questions
    total_questions = db.query(Question).filter(Question.test_id == test_id).count()
    if total_questions == 0:
        return 0.0
    attempts = db.query(Attempt).filter(Attempt.test_id == test_id).all()
    if not attempts:
        return 0.0
    engaged = 0
    for a in attempts:
        if not a.end_ts:
            continue
        answered = db.query(Response).filter(Response.attempt_id == a.id, Response.chosen_index != None).count()
        if answered / total_questions >= min_answer_ratio:
            engaged += 1
    return round(100.0 * engaged / len(attempts), 2)
