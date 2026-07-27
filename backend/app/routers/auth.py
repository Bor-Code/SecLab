import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.database import engine
from app.routers.users import users_table

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str

class LoginResponse(BaseModel):
    message: str
    email: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login_admin(payload: LoginRequest):
    admin_password = os.getenv("SECLAB_ADMIN_PASSWORD")
    
    if not admin_password or payload.password != admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    with engine.connect() as connection:
        query = select(users_table).where(
            (users_table.c.email == payload.email) & 
            (users_table.c.role == "admin")
        )
        result = connection.execute(query)
        user = result.mappings().first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not found or unauthorized"
            )
            
        return {
            "message": "Login successful",
            "email": user["email"],
            "role": user["role"]
        }