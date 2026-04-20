from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from config.database import get_db
from models.models import Document
from services.s3 import upload_file, delete_file
from services.rag_service import embed_document
from services.auth import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])
security = HTTPBearer()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Read file
    file_bytes = file.file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    user_id = current_user["sub"]
    document_id = str(uuid.uuid4())

    try:
        # Step 1 - Upload to S3
        s3_key = upload_file(file_bytes, file.filename, user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    try:
        # Step 2 - Save to PostgreSQL
        document = Document(
            id=document_id,
            user_id=user_id,
            filename=file.filename,
            path=s3_key
        )
        db.add(document)
        db.commit()
        db.refresh(document)

    except Exception as e:
        # Rollback S3 upload if database fails
        delete_file(s3_key)
        raise HTTPException(status_code=500, detail=f"Failed to save document: {str(e)}")

    try:
        # Step 3 - Process for RAG
        collection_name = embed_document(user_id, document_id, file_bytes)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    return {
        "message": "Document uploaded successfully",
        "document_id": document_id,
        "filename": file.filename
    }

@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]
    documents = db.query(Document).filter(Document.user_id == user_id).all()
    return [{"id": str(doc.id), "filename": doc.filename, "uploaded_at": doc.uploaded_at} for doc in documents]