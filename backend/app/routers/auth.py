import os
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, insert, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.activity import record_activity
from app.database import engine

router = APIRouter(prefix="/auth", tags=["auth"])

metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(50), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
    Column("password_hash", String(255), nullable=True),
    Column("role", String(20), nullable=False, default="user"),
    Column("email_verified", Integer, nullable=False, default=0),
    Column("email_verification_token", String(128), nullable=True),
    Column("must_change_password", Integer, nullable=False, default=0),
    Column("password_reset_token", String(128), nullable=True),
    Column("created_at", DateTime, default=lambda: datetime.now(timezone.utc)),
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.getenv("SECLAB_JWT_SECRET", "dev-secret")
REQUIRE_EMAIL_VERIFICATION = os.getenv("SECLAB_REQUIRE_EMAIL_VERIFICATION", "false").lower() == "true"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=5, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=128)
    new_password: str = Field(..., min_length=5, max_length=128)


class EmailResendRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)


class EmailVerificationRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=5, max_length=128)


class ProfileUpdate(BaseModel):
    username: str | None = Field(None, min_length=2, max_length=50)
    email: EmailStr | None = None


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime | None = None


class AuthResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    email_verified: int | None = None
    must_change_password: int | None = None
    demo_verification_token: str | None = None


def ensure_auth_columns(connection):
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 0")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(128)")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password INTEGER NOT NULL DEFAULT 0")
    connection.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(128)")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid email address")


def validate_password_strength(password: str):
    if len(password) < 5:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 5 characters")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    return pwd_context.verify(password, password_hash)


def create_access_token(user: dict) -> tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": expires_at,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM), expires_at


def create_access_response(user: dict) -> dict:
    token, expires_at = create_access_token(user)
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at,
        "email_verified": user.get("email_verified", 0),
        "must_change_password": user.get("must_change_password", 0),
    }


def require_signed_in_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)
            query = select(users_table).where(users_table.c.id == user_id)
            user = connection.execute(query).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

            return dict(user)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in require_signed_in_user: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")


def require_admin_user(current_user: dict = Depends(require_signed_in_user)) -> dict:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    norm_email = normalize_email(payload.email)
    validate_email(norm_email)
    validate_password_strength(payload.password)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            existing_query = select(users_table).where(users_table.c.email == norm_email)
            existing_user = connection.execute(existing_query).mappings().first()

            if existing_user:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

            password_hash = hash_password(payload.password)
            verification_token = secrets.token_urlsafe(32)

            insert_query = (
                insert(users_table)
                .values(
                    username=payload.username.strip(),
                    email=norm_email,
                    role="user",
                    password_hash=password_hash,
                    email_verified=0,
                    email_verification_token=verification_token,
                )
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.email_verified,
                )
            )

            created_user = connection.execute(insert_query).mappings().first()
            record_activity("auth.register", "New user registered", f"{created_user['email']} created an account.")

            response = create_access_response(dict(created_user))
            response["demo_verification_token"] = verification_token
            return response
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in register: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")



@router.post("/resend-verification")
def resend_verification(payload: EmailResendRequest):
    norm_email = normalize_email(payload.email)
    validate_email(norm_email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.email == norm_email)
            user = connection.execute(query).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            if user.get("email_verified"):
                return {"message": "Email is already verified"}

            verification_token = secrets.token_urlsafe(32)

            connection.execute(
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(email_verification_token=verification_token)
            )

            record_activity("auth.resend_verification", "Verification token refreshed", f"{user['email']} requested a new verification token.")

            return {
                "message": "Verification token generated",
                "demo_verification_token": verification_token
            }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in resend_verification: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")


@router.post("/verify-email")
def verify_email(payload: EmailVerificationRequest):
    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.email_verification_token == payload.token)
            user = connection.execute(query).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification token not found")

            update_query = (
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(email_verified=1, email_verification_token=None)
            )
            connection.execute(update_query)

            record_activity("auth.verify_email", "Email verified", f"{user['email']} verified email address.")
            return {"message": "Email verified successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in verify_email: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    norm_email = normalize_email(payload.email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.email == norm_email)
            user = connection.execute(query).mappings().first()

            if not user or not verify_password(payload.password, user["password_hash"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

            if REQUIRE_EMAIL_VERIFICATION and not user.get("email_verified"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email verification required")

            record_activity("auth.login", "User signed in", f"{user['email']} signed in.")
            return create_access_response(dict(user))
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in login: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")



@router.get("/me", response_model=UserRead)
def get_current_user_profile(current_user: dict = Depends(require_signed_in_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user.get("created_at"),
        "email_verified": current_user.get("email_verified", 0),
        "must_change_password": current_user.get("must_change_password", 0),
    }


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
                existing_query = select(users_table).where(
                    users_table.c.email == update_data["email"],
                    users_table.c.id != current_user["id"],
                )
                existing_user = connection.execute(existing_query).mappings().first()

                if existing_user:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

            update_query = (
                update(users_table)
                .where(users_table.c.id == current_user["id"])
                .values(**update_data)
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at,
                )
            )

            updated_user = connection.execute(update_query).mappings().first()

            if not updated_user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            record_activity("profile.update", "Profile updated", f"{updated_user['email']} updated profile details.")
            return dict(updated_user)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in update_current_user: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")

@router.post("/change-password")
def change_password(payload: PasswordChangeRequest, current_user: dict = Depends(require_signed_in_user)):
    validate_password_strength(payload.new_password)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.id == current_user["id"])
            user = connection.execute(query).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            if not verify_password(payload.current_password, user["password_hash"]):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

            update_query = (
                update(users_table)
                .where(users_table.c.id == current_user["id"])
                .values(
                    password_hash=hash_password(payload.new_password),
                    must_change_password=0,
                )
            )
            connection.execute(update_query)

            record_activity("profile.password", "Password changed", f"{user['email']} changed account password.")
            return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in change_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    norm_email = normalize_email(payload.email)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.email == norm_email)
            user = connection.execute(query).mappings().first()

            if not user:
                return {"message": "If the email exists, a password reset token was generated."}

            reset_token = secrets.token_urlsafe(32)

            update_query = (
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(password_reset_token=reset_token)
            )
            connection.execute(update_query)

            record_activity("auth.forgot_password", "Password reset requested", f"{user['email']} requested password reset.")
            return {
                "message": "If the email exists, a password reset token was generated.",
                "demo_reset_token": reset_token,
            }
    except SQLAlchemyError as error:
        print(f"Database error in forgot_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    validate_password_strength(payload.new_password)

    try:
        with engine.begin() as connection:
            ensure_auth_columns(connection)

            query = select(users_table).where(users_table.c.password_reset_token == payload.token)
            user = connection.execute(query).mappings().first()

            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Password reset token not found")

            update_query = (
                update(users_table)
                .where(users_table.c.id == user["id"])
                .values(
                    password_hash=hash_password(payload.new_password),
                    password_reset_token=None,
                    must_change_password=0,
                )
            )
            connection.execute(update_query)

            record_activity("auth.reset_password", "Password reset completed", f"{user['email']} reset account password.")
            return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in reset_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable")

