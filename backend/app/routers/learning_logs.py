from datetime import date, datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/learning-logs",
    tags=["Learning Logs"]
)

class LearningLogCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str = Field(..., min_length=1, max_length=150)
    notes: str | None = Field(default=None)

class LearningLogUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    notes: str | None = Field(default=None)

class LearningLogRead(BaseModel):
    id: int
    user_id: int
    topic_id: int
    title: str
    notes: str | None
    study_date: date
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=list[LearningLogRead])
def get_learning_logs():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM learning_logs ORDER BY id")
        )
        logs = result.mappings().all()
        return [dict(log) for log in logs]

@router.post("", response_model=LearningLogRead, status_code=status.HTTP_201_CREATED)
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

@router.get("/{log_id}", response_model=LearningLogRead)
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

@router.patch("/{log_id}", response_model=LearningLogRead)
def update_learning_log(log_id: int, log: LearningLogUpdate):
    update_data = log.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
    set_query = ",\n                ".join(set_clauses)
    
    with engine.begin() as connection:
        result = connection.execute(
            text(f"""
                UPDATE learning_logs
                SET {set_query}
                WHERE id = :log_id
                RETURNING *
            """),
            {**update_data, "log_id": log_id}
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