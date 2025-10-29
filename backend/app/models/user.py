from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    language_pref = Column(String(10), nullable=True)
    role = Column(String(20), nullable=False, default="student")
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
