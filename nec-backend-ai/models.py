"""
SQLAlchemy ORM models for NEC AI FastAPI backend.
These map to tables created by the Spring Boot Flyway migration.
"""
from sqlalchemy import Column, Integer, Text, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime


class FaqEntry(Base):
    __tablename__ = "faq_entries"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, default="Admissions")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    aliases = relationship("FaqAlias", back_populates="faq_entry", lazy="joined")


class FaqAlias(Base):
    __tablename__ = "faq_aliases"

    id = Column(Integer, primary_key=True, index=True)
    faq_entry_id = Column(Integer, ForeignKey("faq_entries.id", ondelete="CASCADE"), nullable=False)
    alias_text = Column(Text, nullable=False)

    faq_entry = relationship("FaqEntry", back_populates="aliases")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_guest = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)
    text = Column(Text, nullable=False)
    source = Column(String(30))
    matched_faq_id = Column(Integer, ForeignKey("faq_entries.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
