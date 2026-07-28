from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine

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
    role: str = Field(..., min_length=1, max_length=20)

class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=1, max_length=255)
    role: str | None = Field(None, min_length=1, max_length=20)

@router.get("", response_model=list[UserRead])
def get_users(admin: dict = Depends(lambda: None)):
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
def create_user(payload: UserCreate):
    try:
        norm_email = payload.email.strip().lower()
        norm_username = payload.username.strip()

        with engine.begin() as connection:
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
    except SQLAlchemyError as e:
        print(f"Database error in create_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.put("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate):
    try:
        update_data = {}
        if payload.username is not None:
            update_data["username"] = payload.username.strip()
        if payload.email is not None:
            update_data["email"] = payload.email.strip().lower()
        if payload.role is not None:
            update_data["role"] = payload.role

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

        with engine.begin() as connection:
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

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    try:
        with engine.begin() as connection:
            delete_query = delete(users_table).where(users_table.c.id == user_id).returning(users_table.c.id)
            result = connection.execute(delete_query).first()
            if result is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_user: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")
