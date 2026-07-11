from fastapi import APIRouter, status, HTTPException
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

class LearningLogUpdate(BaseModel):
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

@router.get("/{log_id}")
def get_learning_log(log_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM learning_logs WHERE id = :log_id"),
            {"log_id": log_id}
        )
        log = result.mappings().first()
        if log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
        return dict(log)

@router.put("/{log_id}")
def update_learning_log(log_id: int, log: LearningLogUpdate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                UPDATE learning_logs
                SET title = :title,
                    notes = :notes
                WHERE id = :log_id
                RETURNING *
            """),
            {
                "log_id": log_id,
                "title": log.title,
                "notes": log.notes,
            }
        )
        updated_log = result.mappings().first()
        if updated_log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
        return dict(updated_log)

@router.delete("/{log_id}")
def delete_learning_log(log_id: int):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                DELETE FROM learning_logs
                WHERE id = :log_id
                RETURNING *
            """),
            {"log_id": log_id}
        )
        deleted_log = result.mappings().first()
        if deleted_log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
        return {
            "message": "Learning log deleted successfully",
            "deleted_log": dict(deleted_log)
        }