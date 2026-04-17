from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from config.database import get_db
from models.models import User
from services.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: str
    username: str
    firstname: str
    lastname: str
    password: str


class LoginReuqest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(request: SignupRequest, db:Session = Depends(get_db)):
    # check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == request.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user

    new_user = User(
        email = request.email,
        username = request.username,
        firstname = request.firstname,
        lastname = request.lastname,
        password = hash_password(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Account created successfully"}


@router.post("/login")
def login(request: LoginReuqest, db:Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT Token
    token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user" : {
            "id": str(user.id),
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname
        }
    }