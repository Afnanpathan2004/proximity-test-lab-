from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .api import auth as auth_router
from .api import tests as tests_router
from .api import attempts as attempts_router
from .api import reports as reports_router
from .api import teachers as teachers_router
from .core.config import get_settings

app = FastAPI(title="Proximity TestLab API", version="0.1.0")

settings = get_settings()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(tests_router.router)
app.include_router(attempts_router.router)
app.include_router(reports_router.router)
app.include_router(teachers_router.router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"name": "Proximity TestLab API", "version": "0.1.0"}
