from sqlalchemy import Column, Integer, ForeignKey, Boolean, Float
from sqlalchemy.types import DateTime
from sqlalchemy.sql import func
from ..db import Base


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    chosen_index = Column(Integer, nullable=True)
    correct_bool = Column(Boolean, default=False, nullable=False)
    time_taken = Column(Float, nullable=True)  # seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
