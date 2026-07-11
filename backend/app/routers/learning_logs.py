from fastapi import APIRouter, status
from sqlalchemy import text
from pydantic import BaseModel
from app.database import engine

router = APIRouter(
    prefix="/learning-logs",
    tags=["Learning Logs"]
)

class LearningLogCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str
    notes: str | None = None

@router.get("")
def get_learning_logs():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM learning_logs ORDER BY id")
        )
        logs = result.mappings().all()
        return [dict(log) for log in logs]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_learning_log(log: LearningLogCreate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                INSERT INTO learning_logs (user_id, topic_id, title, notes)
                VALUES (:user_id, :topic_id, :title, :notes)
                RETURNING *
            """),
            {
                "user_id": log.user_id,
                "topic_id": log.topic_id,
                "title": log.title,
                "notes": log.notes,
            }
        )
        created_log = result.mappings().first()
        return dict(created_log)