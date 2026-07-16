from datetime import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/users",
    tags=["Users"]
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

@router.get("", response_model=list[UserRead])
def get_users():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM users ORDER BY id")
        )
        users = result.mappings().all()
        return [dict(user) for user in users]

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                INSERT INTO users (username, email)
                VALUES (:username, :email)
                RETURNING *
            """),
            {
                "username": user.username,
                "email": user.email,
            }
        )
        created_user = result.mappings().first()
        return dict(created_user)

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        user = result.mappings().first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return dict(user)

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, user: UserUpdate):
    update_data = user.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
    set_query = ",\n                ".join(set_clauses)
    
    with engine.begin() as connection:
        result = connection.execute(
            text(f"""
                UPDATE users
                SET {set_query}
                WHERE id = :user_id
                RETURNING *
            """),
            {**update_data, "user_id": user_id}
        )
        updated_user = result.mappings().first()
        
        if updated_user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return dict(updated_user)

@router.delete("/{user_id}")
def delete_user(user_id: int):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                DELETE FROM users
                WHERE id = :user_id
                RETURNING *
            """),
            {"user_id": user_id}
        )
        deleted_user = result.mappings().first()
        
        if deleted_user is None:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "message": "User deleted successfully",
            "deleted_user": dict(deleted_user)
        }