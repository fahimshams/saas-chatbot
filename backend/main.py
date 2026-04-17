from fastapi import FastAPI
from config.database import engine, Base
from models.models import User, Document, ChatSession, ChatMessage

app = FastAPI()

# Create all tables on startup
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "SaaS Chatbot API is running"}