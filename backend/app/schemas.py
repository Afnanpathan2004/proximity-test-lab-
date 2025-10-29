from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    language_pref: Optional[str] = None
    role: Optional[str] = "student"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    language_pref: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
