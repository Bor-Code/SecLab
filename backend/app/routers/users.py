from datetime import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, delete, insert, select, update
from app.database import engine

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

metadata = MetaData()
users_table = Table(
    "users",
    metadata,
    Column("id", Integer),
    Column("username", String(50)),
    Column("email", String(255)),
    Column("created_at", DateTime),
)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=255)

class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=50)
    email: str | None = Field(default=None, min_length=1, max_length=255)

class UserRead(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserDeleteResponse(BaseModel):
    message: str
    deleted_user: UserRead

@router.get("", response_model=list[UserRead])
def get_users():
    with engine.connect() as connection:
        query = select(users_table).order_by(users_table.c.id)
        result = connection.execute(query)
        users = result.mappings().all()
        return [dict(user) for user in users]

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    with engine.begin() as connection:
        query = (
            insert(users_table)
            .values(
                username=user.username,
                email=user.email,
            )
            .returning(
                users_table.c.id,
                users_table.c.username,
                users_table.c.email,
                users_table.c.created_at,
            )
        )
        result = connection.execute(query)
        created_user = result.mappings().one()
        return dict(created_user)

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int):
    with engine.connect() as connection:
        query = select(users_table).where(users_table.c.id == user_id)
        result = connection.execute(query)
        user = result.mappings().first()
        
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return dict(user)

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, user: UserUpdate):
    update_data = user.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    query = (
        update(users_table)
        .where(users_table.c.id == user_id)
        .values(**update_data)
        .returning(
            users_table.c.id,
            users_table.c.username,
            users_table.c.email,
            users_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        updated_user = result.mappings().first()
        
        if updated_user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return dict(updated_user)

@router.delete("/{user_id}", response_model=UserDeleteResponse)
def delete_user(user_id: int):
    query = (
        delete(users_table)
        .where(users_table.c.id == user_id)
        .returning(
            users_table.c.id,
            users_table.c.username,
            users_table.c.email,
            users_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        deleted_user = result.mappings().first()
        
        if deleted_user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "message": "User deleted successfully",
            "deleted_user": dict(deleted_user)
        }