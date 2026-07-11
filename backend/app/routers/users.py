from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM users ORDER BY id")
        )
        users = result.mappings().all()
        return [dict(user) for user in users]