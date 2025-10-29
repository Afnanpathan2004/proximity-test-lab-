# Proximity TestLab (MVP)

Multilingual pre/post testing platform with AI MCQ generation and analytics.

## Stack
- Frontend: Next.js 14 + Tailwind + react-i18next (en, hi, mr)
- Backend: FastAPI (Python), SQLite (dev) / Postgres (prod), Redis (future)
- AI: OpenAI Chat Completions (optional during dev)

## Quickstart (Windows, local dev)

### Backend
```powershell
# From project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

@'
SECRET_KEY=please_change_me
DATABASE_URL=sqlite:///./proximity.db
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
'@ | Set-Content -Encoding UTF8 backend\.env

uvicorn app.main:app --reload --port 8000 --app-dir backend
```
Visit http://localhost:8000/health

### Frontend
```powershell
# In another terminal
cd frontend
npm install
npm run dev
```
Visit http://localhost:3000

Create `frontend/.env.local` if backend runs elsewhere:
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## Minimal API flow
1. Register: POST /api/auth/register
2. Login: POST /api/auth/login → store bearer token
3. Create test: POST /api/tests
4. (Optional) AI generate: POST /api/tests/:id/generate (requires OPENAI_API_KEY)
5. Attempt lifecycle: start → answer → submit

## Project structure
- backend/app: FastAPI app, models, APIs
- frontend/src: Next.js app, components, i18n
- infra: docker-compose (optional)

## Notes
- SQLite is used for local dev; switch to Postgres by setting `DATABASE_URL`.
- Do not commit real secrets. Use provided `.env.example` files as templates.
