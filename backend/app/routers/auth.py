import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, insert, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.activity import record_activity
from app.database import engine

JWT_SECRET = os.getenv("SECLAB_JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24

metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(100), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
    Column("role", String(20), nullable=False, default="user"),
    Column("password_hash", String(255), nullable=True),
    Column("email_verified", Integer, nullable=False, default=1),
    Column("email_verification_token", String(128), nullable=True),
    Column("password_reset_token", String(128), nullable=True),
    Column("created_at", DateTime, default=datetime.utcnow),
    extend_existing=True,
)

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=5)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=1)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    password: str = Field(..., min_length=5)


def ensure_auth_columns(connection):
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 1")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(128)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(128)")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçerli bir e-posta gir")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str):
    if not password_hash:
        return False

    try:
        return pwd_context.verify(password, password_hash)
    except UnknownHashError:
        return False


def create_access_token(user_id: int):
    expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    return token, expires_at


def public_user(user: dict):
    return {
        "id": user.get("id"),
        "username": user.get("username"),
        "email": user.get("email"),
        "role": user.get("role") or "user",
        "created_at": user.get("created_at"),
        "email_verified": bool(user.get("email_verified", 1)),
    }


def get_current_user(credentials: HTTPAuthorizationCredentials | str | None = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum bulunamadı")

    if isinstance(credentials, str):
        token = credentials.replace("Bearer ", "", 1).strip()
    else:
        token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum geçersiz veya süresi dolmuş")

    try:
        with engine.begin() as connection:
            user = connection.execute(
                select(users_table).where(users_table.c.id == user_id)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")

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


@router.post("/register")
def register(payload: RegisterRequest):
    email = normalize_email(payload.email)
    validate_email(email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            existing = connection.execute(
                select(users_table.c.id).where(users_table.c.email == email)
            ).first()

            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-posta zaten kayıtlı")

            verification_token = secrets.token_urlsafe(32)

            result = connection.execute(
                insert(users_table)
                .values(
                    username=payload.username.strip(),
                    email=email,
                    role="user",
                    password_hash=hash_password(payload.password),
                    email_verified=0,
                    email_verification_token=verification_token,
                    password_reset_token=None,
                    created_at=datetime.utcnow(),
                )
                .returning(users_table)
            )

            user = dict(result.mappings().one())

            return {
                **public_user(user),
                "demo_verification_token": verification_token,
            }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in register: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/login")
def login(payload: LoginRequest):
    email = normalize_email(payload.email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email == email)
            ).mappings().first()

            if not user or not verify_password(payload.password, user["password_hash"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı")

            if not bool(user.get("email_verified", 1)):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="E-posta doğrulanmamış")

            token, expires_at = create_access_token(user["id"])

            try:
                record_activity("auth.login", "Kullanıcı giriş yaptı", f"{user['email']} giriş yaptı.")
            except Exception as activity_error:
                print(f"Activity error in login: {activity_error}")

            return {
                **public_user(dict(user)),
                "access_token": token,
                "token_type": "bearer",
                "expires_at": expires_at,
            }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in login: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest):
    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email_verification_token == payload.token)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doğrulama tokenı bulunamadı")

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(email_verified=1, email_verification_token=None)
            )

            return {"message": "E-posta doğrulandı"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in verify_email: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    email = normalize_email(payload.email)
    validate_email(email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.email == email)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı")

            reset_token = secrets.token_urlsafe(32)

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(password_reset_token=reset_token)
            )

            return {
                "message": "Şifre sıfırlama tokenı oluşturuldu",
                "demo_reset_token": reset_token,
            }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in forgot_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            user = connection.execute(
                select(users_table).where(users_table.c.password_reset_token == payload.token)
            ).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şifre sıfırlama tokenı bulunamadı")

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(
                    password_hash=hash_password(payload.password),
                    password_reset_token=None,
                    email_verified=1,
                )
            )

            return {"message": "Şifre başarıyla sıfırlandı"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in reset_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Kimlik doğrulama servisi kullanılamıyor")


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return public_user(current_user)