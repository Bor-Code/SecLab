import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, insert, select, text, update
from sqlalchemy.exc import SQLAlchemyError

from app.activity import record_activity
from app.database import engine

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.getenv("SECLAB_JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(100), nullable=False),
    Column("email", String(255), nullable=False),
    Column("role", String(20), nullable=False, default="user"),
    Column("password_hash", String(255), nullable=True),
    Column("email_verified", Integer, nullable=False, default=1),
    Column("email_verification_token", String(128), nullable=True),
    Column("password_reset_token", String(128), nullable=True),
    Column("created_at", DateTime, nullable=True),
    extend_existing=True,
)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=5, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None


class EmailVerificationRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=256)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=256)
    password: str = Field(..., min_length=5, max_length=128)


class AuthResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime | None = None
    email_verified: int | None = 1
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    demo_verification_token: str | None = None
    demo_reset_token: str | None = None


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime | None = None
    email_verified: int | None = 1


def ensure_auth_columns(connection):
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 1")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(128)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(128)")


def normalize_email(email: str):
    return email.strip().lower()


def validate_email(email: str):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")


def validate_password_strength(password: str):
    if len(password) < 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Şifre must be at least 5 characters")


def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str):
    if not password_hash:
        return False

    try:
        return pwd_context.verify(password, password_hash)
    except UnknownHashError:
        return False

def create_access_response(user: dict):
    expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": expires_at,
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user.get("created_at"),
        "email_verified": user.get("email_verified", 1),
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at,
    }


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum açılmamış")

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token geçersiz veya süresi dolmuş")

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)
            user = connection.execute(
                select(users_table).where(users_table.c.id == user_id)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User bulunamadı")

            return dict(user)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in get_current_user: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


def require_signed_in_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin yetkisi gerekli")

    return current_user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    norm_email = normalize_email(payload.email)
    validate_email(norm_email)
    validate_password_strength(payload.password)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            existing = connection.execute(
                select(users_table).where(users_table.c.email == norm_email)
            ).mappings().first()

            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

            verification_token = secrets.token_urlsafe(32)

            created_user = connection.execute(
                insert(users_table)
                .values(
                    username=payload.username.strip(),
                    email=norm_email,
                    role="user",
                    password_hash=hash_password(payload.password),
                    email_verified=1,
                    email_verification_token=verification_token,
                )
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at,
                    users_table.c.email_verified,
                )
            ).mappings().first()

            record_activity("auth.register", "New user registered", f"{created_user['email']} created an account.")

            response = create_access_response(dict(created_user))
            response["demo_verification_token"] = verification_token
            return response
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in register: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    norm_email = normalize_email(payload.email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email == norm_email)
            ).mappings().first()

            if not user or not verify_password(payload.password, user["password_hash"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email veya şifre hatalı")

            record_activity("auth.login", "User signed in", f"{user['email']} signed in.")
            return create_access_response(dict(user))
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in login: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: dict = Depends(require_signed_in_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_current_user(payload: ProfileUpdate, current_user: dict = Depends(require_signed_in_user)):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    if "username" in update_data:
        update_data["username"] = update_data["username"].strip()

    if "email" in update_data:
        update_data["email"] = normalize_email(update_data["email"])
        validate_email(update_data["email"])

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            if "email" in update_data:
                existing = connection.execute(
                    select(users_table).where(
                        users_table.c.email == update_data["email"],
                        users_table.c.id != current_user["id"],
                    )
                ).mappings().first()

                if existing:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

            updated_user = connection.execute(
                update(users_table)
                .where(users_table.c.id == current_user["id"])
                .values(**update_data)
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at,
                    users_table.c.email_verified,
                )
            ).mappings().first()

            if not updated_user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User bulunamadı")

            record_activity("profile.update", "Profile updated", f"{updated_user['email']} updated profile details.")
            return dict(updated_user)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in update_current_user: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/verify-email")
def verify_email(payload: EmailVerificationRequest):
    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email_verification_token == payload.token)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification token not found")

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(email_verified=1, email_verification_token=None)
            )

            record_activity("auth.verify_email", "Email verified", f"{user['email']} verified email address.")
            return {"message": "Email verified successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in verify_email: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/resend-verification")
def resend_verification(payload: ForgotPasswordRequest):
    norm_email = normalize_email(payload.email)
    token_value = secrets.token_urlsafe(32)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email == norm_email)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User bulunamadı")

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(email_verification_token=token_value)
            )

            return {"message": "Verification token created", "demo_verification_token": token_value}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in resend_verification: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    norm_email = normalize_email(payload.email)
    reset_token = secrets.token_urlsafe(32)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                text("SELECT id, email FROM users WHERE email = :email"),
                {"email": norm_email},
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User bulunamadı")

            connection.execute(
                text("UPDATE users SET password_reset_token = :token WHERE id = :user_id"),
                {"token": reset_token, "user_id": user["id"]},
            )

            return {"message": "Şifre reset token created", "demo_reset_token": reset_token}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in forgot_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    validate_password_strength(payload.password)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                text("SELECT id, email FROM users WHERE password_reset_token = :token"),
                {"token": payload.token},
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reset token not found")

            connection.execute(
                text("UPDATE users SET password_hash = :password_hash, password_reset_token = NULL WHERE id = :user_id"),
                {"password_hash": hash_password(payload.password), "user_id": user["id"]},
            )

            return {"message": "Şifre reset successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in reset_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")
