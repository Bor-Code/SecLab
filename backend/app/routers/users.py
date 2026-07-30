from datetime import datetime
import secrets
import string
from typing import Literal
from fastapi import APIRouter, Header, HTTPException, status, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.validation import normalize_email, strip_required_text

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(50), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
    Column("role", String(20), nullable=False, default="user"),
    Column("password_hash", String(255), nullable=True),
    Column("created_at", DateTime, default=datetime.utcnow)
)

class UserRead(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=255)
    role: Literal["user", "admin"] = "user"

    _strip_username = field_validator("username", mode="before")(strip_required_text)
    _normalize_email = field_validator("email", mode="before")(normalize_email)

class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=1, max_length=255)
    role: Literal["user", "admin"] | None = None

    _strip_username = field_validator("username", mode="before")(strip_required_text)
    _normalize_email = field_validator("email", mode="before")(normalize_email)

def create_temporary_password(length: int = 14) -> str:
    alphabet = string.ascii_letters + string.digits

    return (
        secrets.choice(string.ascii_uppercase)
        + secrets.choice(string.ascii_lowercase)
        + secrets.choice(string.digits)
        + "".join(
            secrets.choice(alphabet)
            for _ in range(max(length - 3, 9))
        )
    )


def require_admin_user(authorization: str = Header(None)) -> dict:
    from app.routers.auth import get_current_user

    current_user = get_current_user(authorization)
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yönetici yetkisi gerekli")
    return current_user

@router.get("", response_model=list[UserRead])
def get_users(admin: dict = Depends(require_admin_user)):
    try:
        with engine.begin() as connection:
            query = select(
                users_table.c.id,
                users_table.c.username,
                users_table.c.email,
                users_table.c.role,
                users_table.c.created_at
            )
            result = connection.execute(query)
            return [dict(row) for row in result.mappings()]
    except SQLAlchemyError as e:
        print(f"Database error in get_users: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    admin: dict = Depends(require_admin_user),
):
    try:
        with engine.begin() as connection:
            query = select(
                users_table.c.id,
                users_table.c.username,
                users_table.c.email,
                users_table.c.role,
                users_table.c.created_at
            ).where(users_table.c.id == user_id)
            result = connection.execute(query).mappings().first()
            if result is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı")
            return dict(result)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in get_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, admin: dict = Depends(require_admin_user)):
    try:
        norm_email = payload.email.strip().lower()
        norm_username = payload.username.strip()

        if not norm_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kullanıcı adı boş olamaz"
            )
        if not norm_email or "@" not in norm_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçerli bir e-posta adresi girin"
            )

        with engine.begin() as connection:
            existing_user_id = connection.execute(
                select(users_table.c.id).where(
                    users_table.c.email == norm_email
                )
            ).scalar_one_or_none()
            if existing_user_id is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bu e-posta adresi zaten kayıtlı"
                )

            insert_query = (
                insert(users_table)
                .values(
                    username=norm_username,
                    email=norm_email,
                    role=payload.role
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
            return dict(result.mappings().one())
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in create_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate, admin: dict = Depends(require_admin_user)):
    try:
        update_data = {}
        if payload.username is not None:
            username = payload.username.strip()
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kullanıcı adı boş olamaz"
                )
            update_data["username"] = username
        if payload.email is not None:
            email = payload.email.strip().lower()
            if not email or "@" not in email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Geçerli bir e-posta adresi girin"
                )
            update_data["email"] = email
        if payload.role is not None:
            update_data["role"] = payload.role

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek alan bulunamadı")

        with engine.begin() as connection:
            if "email" in update_data:
                existing_user_id = connection.execute(
                    select(users_table.c.id).where(
                        users_table.c.email == update_data["email"],
                        users_table.c.id != user_id
                    )
                ).scalar_one_or_none()
                if existing_user_id is not None:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Bu e-posta adresi başka bir hesapta kullanılıyor"
                    )

            update_query = (
                update(users_table)
                .where(users_table.c.id == user_id)
                .values(**update_data)
                .returning(
                    users_table.c.id,
                    users_table.c.username,
                    users_table.c.email,
                    users_table.c.role,
                    users_table.c.created_at
                )
            )
            result = connection.execute(update_query).mappings().first()
            if result is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı")
            return dict(result)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in update_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.post("/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    admin: dict = Depends(require_admin_user),
):
    from app.routers.auth import hash_password

    temporary_password = create_temporary_password()

    try:
        with engine.begin() as connection:
            updated_user_id = connection.execute(
                update(users_table)
                .where(users_table.c.id == user_id)
                .values(
                    password_hash=hash_password(temporary_password)
                )
                .returning(users_table.c.id)
            ).scalar_one_or_none()

        if updated_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kullanıcı bulunamadı",
            )

        return {
            "message": "Kullanıcı şifresi sıfırlandı.",
            "temporary_password": temporary_password,
        }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error during admin password reset: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Şifre sıfırlama servisi kullanılamıyor",
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin: dict = Depends(require_admin_user)):
    try:
        with engine.begin() as connection:
            target_user = connection.execute(
                select(
                    users_table.c.id,
                    users_table.c.role
                ).where(users_table.c.id == user_id)
            ).mappings().first()

            if target_user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Kullanıcı bulunamadı"
                )

            if target_user["id"] == admin["id"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kendi hesabınızı silemezsiniz"
                )

            if target_user["role"] == "admin":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Yönetici hesabı silinemez"
                )

            delete_query = delete(users_table).where(users_table.c.id == user_id).returning(users_table.c.id)
            result = connection.execute(delete_query).first()
            if result is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı")
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")
