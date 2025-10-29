from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.test import Test
from ..models.attempt import Attempt
from ..models.response import Response
from ..models.question import Question
from ..services.analytics import compute_attempt_breakdown, compute_class_metrics, compute_teacher_score
from ..services.pdf_render import save_attempt_pdf, save_attempt_html

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/attempts/{attempt_id}")
def report_attempt(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    # Only owner or admin/creator of the test can view
    t = db.query(Test).filter(Test.id == a.test_id).first()
    if user.id != a.user_id and user.role not in ("admin",) and (not t or user.id != t.creator_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    data = compute_attempt_breakdown(db, attempt_id)
    return data


@router.get("/tests/{test_id}/class")
def report_class(test_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Test).filter(Test.id == test_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    # Only creator or admin
    if user.role not in ("admin",) and user.id != t.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    metrics = compute_class_metrics(db, test_id)
    return {"test_id": test_id, **metrics}


@router.get("/attempts/{attempt_id}/pdf")
def download_attempt_pdf(
    attempt_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Attempt not found")
    t = db.query(Test).filter(Test.id == a.test_id).first()
    if user.id != a.user_id and user.role not in ("admin",) and (not t or user.id != t.creator_id):
        raise HTTPException(status_code=403, detail="Not allowed")

    pdf_path = save_attempt_pdf(db, attempt_id)
    if pdf_path:
        return FileResponse(pdf_path, filename=f"attempt_{attempt_id}.pdf", media_type="application/pdf")

    # Fallback to HTML export if PDF engine unavailable
    html_path = save_attempt_html(db, attempt_id)
    return FileResponse(html_path, filename=f"attempt_{attempt_id}.html", media_type="text/html")
