from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.test import Test
from ..services.analytics import (
    compute_class_metrics,
    compute_pass_rate_post,
    compute_engagement,
    compute_teacher_score,
)

router = APIRouter(prefix="/api/teachers", tags=["teachers"]) 


def _normalize_delta(delta: float, min_possible: float = -100.0, max_possible: float = 100.0) -> float:
    span = max_possible - min_possible
    if span <= 0:
        return 0.0
    norm = (delta - min_possible) / span * 100.0
    return max(0.0, min(100.0, norm))


@router.get("/{teacher_id}/score")
def teacher_score(
    teacher_id: int,
    test_id: int = Query(..., description="Test ID for which to compute teacher score"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Only the teacher themself or admin can view
    if user.role not in ("admin",) and user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    if user.role not in ("admin",) and t.creator_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not allowed for this test")

    metrics = compute_class_metrics(db, test_id)
    pass_threshold = 50.0
    if t.settings and isinstance(t.settings, dict):
        pass_threshold = float(t.settings.get("pass_threshold", pass_threshold))

    pass_rate = compute_pass_rate_post(db, test_id, pass_threshold)
    engagement = compute_engagement(db, test_id)
    delta_norm = _normalize_delta(metrics.get("improvement", 0.0))

    score = compute_teacher_score(
        delta_avg=delta_norm,
        pass_rate_post=pass_rate,
        topic_coverage=100.0 - len(metrics.get("weak_topics", [])) * 5.0 if metrics.get("weak_topics") is not None else 0.0,
        engagement=engagement,
    )

    return {
        "teacher_id": teacher_id,
        "test_id": test_id,
        "score": score,
        "breakdown": {
            "delta_avg_norm": delta_norm,
            "pass_rate_post": pass_rate,
            "engagement": engagement,
            "topic_coverage_note": "Derived from weak_topics count",
        },
        "class_metrics": metrics,
    }
