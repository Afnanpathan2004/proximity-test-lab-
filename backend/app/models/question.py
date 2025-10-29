from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..db import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False, index=True)
    stem = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["A","B","C","D"]
    correct_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    topic_tag = Column(String(100), nullable=True)
    difficulty = Column(String(20), nullable=True)  # easy|medium|hard
    language = Column(String(10), nullable=True)
    ai_generated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
