import os
import hashlib
import hmac
import secrets
import re
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, Field
from sqlalchemy import insert, select, update
from sqlalchemy.exc import SQLAlchemyError
from jose import jwt, JWTError
from app.database import engine
from app.routers.users import users_table

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

JWT_SECRET = os.getenv("SECLAB_JWT_SECRET", "seclab_super_secret_jwt_key_2026_change_in_production")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("SECLAB_TOKEN_EXPIRE_MINUTES", "60"))


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def is_valid_email(value: str) -> bool:
    return bool(EMAIL_PATTERN.match(value.strip().lower()))

def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=255)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=255)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=255)

class AuthUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime
    access_token: str
    token_type: str = "bearer"
    expires_at: str

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

def create_access_token(user_dict: dict) -> tuple[str, datetime]:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_dict["id"]),
        "email": user_dict["email"],
        "role": user_dict["role"],
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt, expire

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))

    with engine.begin() as connection:
        query = select(users_table).where(users_table.c.id == user_id)
        user = connection.execute(query).mappings().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return dict(user)

def require_signed_in_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.post("/register", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest):
    try:
        norm_email = payload.email.strip().lower()
        norm_username = payload.username.strip()

        if not norm_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username cannot be empty")

        if not is_valid_email(norm_email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")

        validate_password_strength(payload.password)

        with engine.begin() as connection:
            check_query = select(users_table).where(users_table.c.email == norm_email)
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
                    username=norm_username,
                    email=norm_email,
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
            new_user = dict(result.mappings().one())

            token, expire = create_access_token(new_user)
            new_user["access_token"] = token
            new_user["token_type"] = "bearer"
            new_user["expires_at"] = expire.isoformat()
            return new_user
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error during register: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )


@router.patch("/password")
def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(require_signed_in_user)):
    validate_password_strength(payload.new_password)

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )

    stored_hash = current_user.get("password_hash")
    if not verify_password(payload.current_password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    try:
        new_hash = hash_password(payload.new_password)
        with engine.begin() as connection:
            update_query = (
                update(users_table)
                .where(users_table.c.id == current_user["id"])
                .values(password_hash=new_hash)
            )
            connection.execute(update_query)

        return {"message": "Password changed successfully"}
    except SQLAlchemyError as e:
        print(f"Database error during password change: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )


@router.post("/login", response_model=AuthUserResponse)
def login_user(payload: LoginRequest):
    try:
        norm_email = payload.email.strip().lower()

        with engine.begin() as connection:
            query = select(users_table).where(users_table.c.email == norm_email)
            result = connection.execute(query)
            user = result.mappings().first()

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            user_dict = dict(user)
            stored_hash = user_dict.get("password_hash")
            
            if not stored_hash and user_dict["role"] == "admin":
                admin_password = os.getenv("SECLAB_ADMIN_PASSWORD")
                if admin_password and payload.password == admin_password:
                    new_hash = hash_password(payload.password)
                    update_query = (
                        update(users_table)
                        .where(users_table.c.id == user_dict["id"])
                        .values(password_hash=new_hash)
                    )
                    connection.execute(update_query)
                    user_dict["password_hash"] = new_hash

            if not verify_password(payload.password, user_dict.get("password_hash")):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            token, expire = create_access_token(user_dict)
            user_dict["access_token"] = token
            user_dict["token_type"] = "bearer"
            user_dict["expires_at"] = expire.isoformat()
            return user_dict
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )
