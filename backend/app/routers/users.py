import secrets
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.routers.auth import hash_password
from app.activity import record_activity

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

metadata = MetaData()

ALLOWED_ROLES = {'admin', 'user'}

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
    role: str = Field(..., min_length=1, max_length=20)

class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=1, max_length=255)
    role: str | None = Field(None, min_length=1, max_length=20)

def validate_role(role: str) -> str:
    normalized_role = role.strip().lower()
    if normalized_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be admin or user"
        )
    return normalized_role

def count_admin_users(connection) -> int:
    query = select(users_table.c.id).where(users_table.c.role == "admin")
    return len(connection.execute(query).fetchall())

def require_admin_user(authorization: str = Header(None)) -> dict:
    from app.routers.auth import get_current_user

    current_user = get_current_user(authorization)
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

@router.get("", response_model=list[UserRead])
def get_users(admin: dict = Depends(require_admin_user)):
    temporary_password = secrets.token_urlsafe(8)

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
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int):
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
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            return dict(result)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in get_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, admin: dict = Depends(require_admin_user)):
    try:
        norm_email = payload.email.strip().lower()
        norm_username = payload.username.strip()

        with engine.begin() as connection:
            insert_query = (
                insert(users_table)
                .values(
                    username=norm_username,
                    email=norm_email,
                    role=validate_role(payload.role)
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
    except SQLAlchemyError as e:
        print(f"Database error in create_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate, admin: dict = Depends(require_admin_user)):
    try:
        update_data = {}
        if payload.username is not None:
            update_data["username"] = payload.username.strip()
        if payload.email is not None:
            update_data["email"] = payload.email.strip().lower()
        if payload.role is not None:
            update_data["role"] = validate_role(payload.role)

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

        with engine.begin() as connection:
            existing_query = select(users_table).where(users_table.c.id == user_id)
            existing_user = connection.execute(existing_query).mappings().first()

            if existing_user is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            if (
                existing_user["role"] == "admin"
                and update_data.get("role") == "user"
                and count_admin_users(connection) <= 1
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the last admin account"
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
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            return dict(result)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in update_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")



@router.post("/{user_id}/reset-password")
def reset_user_password(user_id: int, current_user: dict = Depends(require_admin_user)):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins should change their own password from profile")

    temporary_password = secrets.token_urlsafe(8)

    try:
        with engine.begin() as connection:
            existing_query = select(users_table).where(users_table.c.id == user_id)
            existing_user = connection.execute(existing_query).mappings().first()

            if not existing_user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            update_query = (
                update(users_table)
                .where(users_table.c.id == user_id)
                .values(
                    password_hash=hash_password(temporary_password),
                    must_change_password=1,
                )
            )
            connection.execute(update_query)

            record_activity("users.reset_password", "User password reset", f"{existing_user['email']} received a temporary password.")
            return {
                "message": "Temporary password generated",
                "temporary_password": temporary_password,
            }
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in reset_user_password: {error}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin: dict = Depends(require_admin_user)):
    try:
        if user_id == admin["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admins cannot delete their own account"
            )

        with engine.begin() as connection:
            existing_query = select(users_table).where(users_table.c.id == user_id)
            existing_user = connection.execute(existing_query).mappings().first()

            if existing_user is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            if existing_user["role"] == "admin" and count_admin_users(connection) <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete the last admin account"
                )

            delete_query = delete(users_table).where(users_table.c.id == user_id).returning(users_table.c.id)
            connection.execute(delete_query)
            record_activity('users.delete', 'User deleted', f'User id {user_id} was deleted by admin.')
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")


