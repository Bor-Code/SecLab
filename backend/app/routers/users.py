from fastapi import APIRouter, status
from pydantic import BaseModel
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

class UserCreate(BaseModel):
    username: str
    email: str

@router.get("")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM users ORDER BY id")
        )
        users = result.mappings().all()
        return [dict(user) for user in users]

@router.post("", status_code=status.HTTP_201_CREATED)
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