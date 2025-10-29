from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..core.auth import get_current_user
from ..models.test import Test
from ..models.user import User
from ..core.security import hash_password
from ..models.question import Question
from ..services.ai_generation import generate_mcqs
from ..services.ratelimit import allow as rl_allow

router = APIRouter(prefix="/api/tests", tags=["tests"])


@router.get("")
def list_tests(
    mine: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Test)
    if mine:
        q = q.filter(Test.creator_id == user.id)
    items = q.order_by(Test.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "language": t.language,
            "created_at": t.created_at,
        }
        for t in items
    ]


@router.post("")
def create_test(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("admin", "teacher"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="title is required")
    access_key = payload.get("access_key")
    access_key_hash = hash_password(access_key) if access_key else None

    test = Test(
        creator_id=user.id,
        title=title,
        syllabus=payload.get("syllabus"),
        language=payload.get("language"),
        access_key_hash=access_key_hash,
        settings=payload.get("settings") or {},
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return {"id": test.id, "title": test.title, "language": test.language}


@router.get("/{test_id}")
def get_test(test_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    # only creator or admin can view meta for now
    if user.role not in ("admin",) and user.id != test.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return {
        "id": test.id,
        "title": test.title,
        "language": test.language,
        "created_at": test.created_at,
    }


@router.get("/{test_id}/questions")
def list_questions(
    test_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Allow any authenticated user to fetch questions text, but hide answers
    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    qs = (
        db.query(Question)
        .filter(Question.test_id == test_id)
        .order_by(Question.id.asc())
        .all()
    )
    return [
        {
            "id": q.id,
            "stem": q.stem,
            "options": q.options,
            "topic_tag": q.topic_tag,
            "difficulty": q.difficulty,
            "language": q.language,
        }
        for q in qs
    ]


@router.post("/{test_id}/generate")
def generate_questions(
    test_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    if user.role not in ("admin",) and user.id != t.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    topic = payload.get("topic") or t.title
    syllabus = payload.get("syllabus") or (t.syllabus or "")
    n = int(payload.get("n") or 5)
    language = payload.get("language") or t.language or "en"

    # naive rate-limit: 5/min per user+test
    if not rl_allow(f"gen:{user.id}:{test_id}", limit=5, window_seconds=60):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    items = generate_mcqs(topic=topic, syllabus=syllabus, n=n, language=language)
    created = 0
    for it in items:
        try:
            q = Question(
                test_id=t.id,
                stem=it.get("stem", "").strip(),
                options=it.get("options", []),
                correct_index=int(it.get("correct", 0)),
                explanation=it.get("explanation"),
                topic_tag=it.get("topic_tag"),
                difficulty=it.get("difficulty"),
                language=language,
                ai_generated=True,
            )
            db.add(q)
            created += 1
        except Exception:
            continue
    db.commit()
    return {"generated": created}


@router.put("/{test_id}/questions/{qid}")
def edit_question(
    test_id: int,
    qid: int,
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    if user.role not in ("admin",) and user.id != t.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    q = db.query(Question).filter(Question.id == qid, Question.test_id == test_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    for field in ["stem", "options", "explanation", "topic_tag", "difficulty", "language", "correct_index"]:
        if field in payload:
            setattr(q, field, payload[field])
    db.commit()
    db.refresh(q)
    return {"updated": True, "id": q.id}
