from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..core.auth import get_current_user
from ..core.security import verify_password
from ..models.user import User
from ..models.test import Test
from ..models.attempt import Attempt
from ..models.response import Response
from ..models.question import Question
from ..services.scoring import compute_attempt_score

router = APIRouter(prefix="/api", tags=["attempts"])


@router.get("/attempts")
def list_attempts(
    test_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Attempt).filter(Attempt.user_id == user.id)
    if test_id:
        q = q.filter(Attempt.test_id == test_id)
    items = q.order_by(Attempt.start_ts.desc()).all()
    return [
        {
            "id": a.id,
            "test_id": a.test_id,
            "type": a.type,
            "start_ts": a.start_ts,
            "end_ts": a.end_ts,
            "score": a.score,
        }
        for a in items
    ]


@router.post("/tests/{test_id}/start")
def start_attempt(test_id: int, payload: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    # If access key is set, verify
    if t.access_key_hash:
        key = payload.get("access_key")
        if not key or not verify_password(key, t.access_key_hash):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid access key")
    a_type = (payload.get("type") or "pre").lower()
    if a_type not in ("pre", "post"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be pre or post")
    attempt = Attempt(user_id=user.id, test_id=test_id, type=a_type)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id, "type": attempt.type, "start_ts": attempt.start_ts}


@router.post("/attempts/{attempt_id}/answer")
def save_answer(attempt_id: int, payload: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id, Attempt.user_id == user.id).first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    qid = payload.get("question_id")
    if not qid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="question_id is required")
    question = db.query(Question).filter(Question.id == qid, Question.test_id == attempt.test_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    chosen_index = payload.get("chosen_index")
    time_taken = payload.get("time_taken")

    resp = (
        db.query(Response)
        .filter(Response.attempt_id == attempt.id, Response.question_id == qid)
        .first()
    )
    is_correct = chosen_index is not None and chosen_index == question.correct_index
    if resp:
        resp.chosen_index = chosen_index
        resp.correct_bool = bool(is_correct)
        resp.time_taken = time_taken
    else:
        resp = Response(
            attempt_id=attempt.id,
            question_id=qid,
            chosen_index=chosen_index,
            correct_bool=bool(is_correct),
            time_taken=time_taken,
        )
        db.add(resp)
    db.commit()
    return {"saved": True, "correct": bool(is_correct)}


@router.post("/attempts/{attempt_id}/submit")
def submit_attempt(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id, Attempt.user_id == user.id).first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    attempt.end_ts = datetime.now(timezone.utc)
    score = compute_attempt_score(db, attempt.id)
    attempt.score = score
    db.commit()
    return {"attempt_id": attempt.id, "score": score, "submitted": True}
