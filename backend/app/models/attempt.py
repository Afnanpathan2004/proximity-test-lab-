from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from ..db import Base


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False, index=True)
    type = Column(String(10), nullable=False)  # pre | post
    start_ts = Column(DateTime(timezone=True), server_default=func.now())
    end_ts = Column(DateTime(timezone=True), nullable=True)
    score = Column(Float, nullable=True)
    meta = Column(String, nullable=True)  # JSON as string for simplicity
