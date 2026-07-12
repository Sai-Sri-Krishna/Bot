"""
Chat router for NEC AI FastAPI backend.

Endpoints:
  GET  /api/predefined  — returns all FAQ entries (for Angular FAQ tab)
  POST /api/chat        — runs FAQ matching + optional Gemini fallback
  POST /api/chat/history — persists session messages to DB
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import FaqEntry, ChatSession, ChatMessage
from services.faq_matcher import find_local_answer
from services.gemini_service import get_gemini_response, FALLBACK_RESPONSE

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    role: str  # "user" | "model"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[HistoryItem]] = []


class ChatResponse(BaseModel):
    answer: str
    source: str
    matched_question: Optional[str] = None


class MessageItem(BaseModel):
    sender: str   # "USER" | "ASSISTANT"
    text: str
    source: Optional[str] = None


class SaveHistoryRequest(BaseModel):
    is_guest: bool = True
    user_id: Optional[int] = None
    messages: list[MessageItem]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _faq_to_dict(faq: FaqEntry) -> dict:
    return {
        "id": faq.id,
        "question": faq.question,
        "answer": faq.answer,
        "category": faq.category,
        "aliases": [a.alias_text for a in (faq.aliases or [])]
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/predefined")
def get_predefined(db: Session = Depends(get_db)):
    """Return all FAQ entries — consumed by Angular FAQs tab."""
    faqs = db.query(FaqEntry).order_by(FaqEntry.category, FaqEntry.id).all()
    return [_faq_to_dict(f) for f in faqs]


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main chat endpoint.
    1. Tries local FAQ fuzzy match first.
    2. Falls back to Gemini AI if no match.
    """
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    # Load FAQs from DB
    faqs = db.query(FaqEntry).all()
    faq_dicts = [_faq_to_dict(f) for f in faqs]

    # Try local match
    match = find_local_answer(message, faq_dicts)
    if match:
        return ChatResponse(
            answer=match["answer"],
            source="local",
            matched_question=match["question"]
        )

    # No local match — call Gemini
    history_payload = [{"role": h.role, "content": h.content} for h in (request.history or [])]
    answer, source = get_gemini_response(message, history_payload)
    return ChatResponse(answer=answer, source=source)


@router.post("/chat/history", status_code=201)
def save_history(request: SaveHistoryRequest, db: Session = Depends(get_db)):
    """Persist a completed conversation session to the database."""
    session = ChatSession(
        user_id=request.user_id,
        is_guest=request.is_guest
    )
    db.add(session)
    db.flush()

    for msg in request.messages:
        db_msg = ChatMessage(
            session_id=session.id,
            sender=msg.sender,
            text=msg.text,
            source=msg.source
        )
        db.add(db_msg)

    db.commit()
    return {"session_id": session.id, "messages_saved": len(request.messages)}
