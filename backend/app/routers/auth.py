import os
import hashlib
import hmac
import secrets
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import insert, select, update
from app.database import engine
from app.routers.users import users_table

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str

class AuthUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"pbkdf2_sha256${salt}${password_hash}"

def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        algorithm, salt, expected_hash = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        password_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return hmac.compare_digest(password_hash, expected_hash)
    except Exception:
        return False

@router.post("/register", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest):
    with engine.begin() as connection:
        # Check if email already exists
        check_query = select(users_table).where(users_table.c.email == payload.email)
        existing = connection.execute(check_query).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        hashed = hash_password(payload.password)
        insert_query = (
            insert(users_table)
            .values(
                username=payload.username,
                email=payload.email,
                role="user",
                password_hash=hashed
            )
            .returning(
                users_table.c.id,
                users_table.c.username,
                users_table.c.email,
                users_table.c.role,
                users_table.c.created_at
            )
        )
        result = connection.execute(insert_query)
        new_user = result.mappings().one()
        return dict(new_user)

@router.post("/login", response_model=AuthUserResponse)
def login_user(payload: LoginRequest):
    with engine.begin() as connection:
        query = select(users_table).where(users_table.c.email == payload.email)
        result = connection.execute(query)
        user = result.mappings().first()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        stored_hash = user.get("password_hash")
        
        # Fallback check for admin if password_hash is empty and SECLAB_ADMIN_PASSWORD matches
        if not stored_hash and user["role"] == "admin":
            admin_password = os.getenv("SECLAB_ADMIN_PASSWORD")
            if admin_password and payload.password == admin_password:
                new_hash = hash_password(payload.password)
                update_query = (
                    update(users_table)
                    .where(users_table.c.id == user["id"])
                    .values(password_hash=new_hash)
                )
                connection.execute(update_query)
                return dict(user)

        if not verify_password(payload.password, stored_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        return dict(user)