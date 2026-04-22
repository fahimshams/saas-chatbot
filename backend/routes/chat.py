from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from config.database import get_db
from models.models import ChatSession, ChatMessage, Document
from services.rag_service import query_document
from services.auth import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import os
import uuid
from services.claude import connect_claude_api
from uuid import UUID

router = APIRouter(prefix="/chat", tags=["chat"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload

class CreateSessionRequest(BaseModel):
    document_id:str
    title: str

class ChatRequest(BaseModel):
    session_id:str
    message:str


# ── Create a new chat session ──────────────────────────
@router.post("/sessions")
def create_session(
    request: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]

    # Verify document belongs to user
    document = db.query(Document).filter(
        Document.id == request.document_id,
        Document.user_id == user_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    session = ChatSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        document_id=request.document_id,
        title=request.title
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": str(session.id), "title":session.title}

# ── Get all sessions for a user ───────────────────────
@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "created_at": s.created_at,
            "document_id": str(s.document_id)  # add this
        } 
        for s in sessions
    ]

# ── Send a message ────────────────────────────────────
@router.post("/message")
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]

    # Verify session belongs to user
    session = db.query(ChatSession).filter(ChatSession.id == request.session_id,
                                           ChatSession.user_id == user_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Load message history from database
    history = db.query(ChatMessage).filter(
        ChatMessage.session_id == request.session_id
    ).order_by(ChatMessage.timestamp).all()

    messages = [{"role":msg.role, "content":msg.content} for msg in history]

    # Save user message to database  
    user_message=ChatMessage(
        id=str(uuid.uuid4()),
        session_id=request.session_id,
        role="user",
        content=request.message

    )

    db.add(user_message)
    db.commit()

    # Query Chroma DB for relevant context
    collection_name = f"user_{user_id}_{session.document_id}".replace("-","_")

    try:
        context = query_document(
            collection_name,
            request.message
        )
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"RAG query failed: {str(e)}")
    
    # Add current message to history
    messages.append({"role":"user", "content":request.message})

    # Call Claude API
    answer = connect_claude_api(context, messages)

    # Save assistant message to database
    assistant_message = ChatMessage(
        id=str(uuid.uuid4()),
        session_id = request.session_id,
        role="assistant",
        content=answer
    )

    db.add(assistant_message)
    db.commit()

    return {"response":answer}

# ── Get message history ───────────────────────────────
@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id:str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]
    print(f"Looking for session_id: {session_id}")
    print(f"user_id: {user_id}")
    session = db.query(ChatSession).filter(
        ChatSession.id == UUID(session_id),
        ChatSession.user_id == UUID(user_id)
    ).first()

    print(f"Session found: {session}")

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # all_messaged = db.query(ChatMessage).all()
    # print(len(all_messaged))
    # for msg in all_messaged:
    #     print(f"  session_id in db: {msg.session_id}, type: {type(msg.session_id)}")
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == UUID(session_id)
    ).order_by(ChatMessage.timestamp).all()
    print(messages)


    return[{"role":msg.role, "content":msg.content} for msg in messages]


