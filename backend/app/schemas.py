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
    email: str
    language_pref: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    language_pref: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
