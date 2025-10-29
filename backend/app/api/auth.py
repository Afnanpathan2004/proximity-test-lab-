from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas import UserCreate, UserOut, LoginRequest, Token
from ..models.user import User
from ..dependencies import get_db
from ..core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from ..core.auth import get_current_user
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        language_pref=payload.language_pref,
        role=payload.role or "student",
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email)
    rtoken = create_refresh_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer", "refresh_token": rtoken}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/refresh", response_model=Token)
def refresh(payload: dict):
    rtoken = payload.get("refresh_token")
    if not rtoken:
        raise HTTPException(status_code=400, detail="refresh_token required")
    data = decode_token(rtoken)
    if not data or data.get("typ") != "refresh" or not data.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access = create_access_token(subject=data.get("sub"))
    return {"access_token": new_access, "token_type": "bearer", "refresh_token": rtoken}


@router.post("/guest_login", response_model=Token)
def guest_login(payload: dict, db: Session = Depends(get_db)):
    name = (payload.get("name") or "Guest").strip() or "Guest"
    if len(name) > 200:
        name = name[:200]
    import uuid
    # try a few times in case of rare collision
    for _ in range(3):
        try:
            email = f"guest+{uuid.uuid4().hex[:10]}@example.local"
            password = uuid.uuid4().hex
            user = User(name=name, email=email, role="student", hashed_password=hash_password(password))
            db.add(user)
            db.commit()
            token = create_access_token(subject=user.email)
            rtoken = create_refresh_token(subject=user.email)
            return {"access_token": token, "token_type": "bearer", "refresh_token": rtoken}
        except IntegrityError:
            db.rollback()
            continue
        except Exception:
            db.rollback()
            raise HTTPException(status_code=500, detail="Guest creation failed")
    raise HTTPException(status_code=500, detail="Guest creation failed")
