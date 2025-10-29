import os
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.attempt import Attempt
from ..models.question import Question
from ..models.response import Response
from ..models.test import Test
from ..models.user import User

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'storage', 'pdfs')


def ensure_storage():
    path = os.path.abspath(STORAGE_DIR)
    os.makedirs(path, exist_ok=True)
    return path


def render_attempt_html(db: Session, attempt_id: int) -> str:
    a = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not a:
        return "<html><body><h1>Attempt not found</h1></body></html>"
    t = db.query(Test).filter(Test.id == a.test_id).first()
    u = db.query(User).filter(User.id == a.user_id).first()

    rows = (
        db.query(Question, Response)
        .join(Response, Response.question_id == Question.id, isouter=True)
        .filter(Response.attempt_id == a.id)
        .all()
    )

    questions_html = []
    for q, r in rows:
        chosen = (r.chosen_index if r else None)
        correct = (q.correct_index == chosen) if chosen is not None else False
        questions_html.append(
            f"""
          <tr>
            <td style='padding:8px;border:1px solid #eee'>{q.stem}</td>
            <td style='padding:8px;border:1px solid #eee'>{"ABCD"[q.correct_index] if q.correct_index is not None else '-'}</td>
            <td style='padding:8px;border:1px solid #eee'>{("ABCD"[chosen] if chosen is not None else '-')}</td>
            <td style='padding:8px;border:1px solid #eee'>{'✔️' if correct else '❌'}</td>
            <td style='padding:8px;border:1px solid #eee'>{q.explanation or ''}</td>
          </tr>
            """
        )

    body = f"""
    <html>
    <head>
      <meta charset='utf-8'/>
      <title>Attempt #{a.id} Report</title>
      <style>
        body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji'; color: #111; }}
        .card {{ border:1px solid #e5e7eb; border-radius:12px; padding:20px; margin:16px 0; }}
        .muted {{ color:#6b7280; font-size: 12px; }}
        .title {{ font-weight:600; font-size:20px; }}
        table {{ border-collapse: collapse; width:100%; }}
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='title'>Proximity TestLab Report</div>
        <div class='muted'>Generated {datetime.utcnow().isoformat()}Z</div>
      </div>
      <div class='card'>
        <div><strong>Student:</strong> {u.name if u else '-'} ({u.email if u else '-'})</div>
        <div><strong>Test:</strong> #{t.id if t else '-'} {t.title if t else '-'}</div>
        <div><strong>Attempt:</strong> #{a.id} • {a.type.upper()} • Score: {a.score if a.score is not None else '-'}
        </div>
      </div>
      <div class='card'>
        <div class='title' style='font-size:16px'>Question-by-Question</div>
        <table>
          <thead>
            <tr>
              <th style='padding:8px;border:1px solid #eee;text-align:left'>Question</th>
              <th style='padding:8px;border:1px solid #eee;text-align:left'>Correct</th>
              <th style='padding:8px;border:1px solid #eee;text-align:left'>Your Answer</th>
              <th style='padding:8px;border:1px solid #eee;text-align:left'>Result</th>
              <th style='padding:8px;border:1px solid #eee;text-align:left'>Explanation</th>
            </tr>
          </thead>
          <tbody>
            {''.join(questions_html)}
          </tbody>
        </table>
      </div>
    </body>
    </html>
    """
    return body


def save_attempt_html(db: Session, attempt_id: int) -> str:
    ensure_storage()
    html = render_attempt_html(db, attempt_id)
    out_path = os.path.abspath(os.path.join(STORAGE_DIR, f"attempt_{attempt_id}.html"))
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    return out_path


def save_attempt_pdf(db: Session, attempt_id: int) -> str | None:
    ensure_storage()
    html = render_attempt_html(db, attempt_id)
    try:
        from weasyprint import HTML
    except Exception:
        # PDF engine not available in this environment
        return None
    out_path = os.path.abspath(os.path.join(STORAGE_DIR, f"attempt_{attempt_id}.pdf"))
    HTML(string=html).write_pdf(out_path)
    return out_path
