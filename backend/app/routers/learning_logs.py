from datetime import date, datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, Date, DateTime, Integer, MetaData, String, Table, Text, delete, insert, or_, select, update
from app.database import engine

router = APIRouter(
    prefix="/learning-logs",
    tags=["Learning Logs"]
)

metadata = MetaData()
learning_logs_table = Table(
    "learning_logs",
    metadata,
    Column("id", Integer),
    Column("user_id", Integer),
    Column("topic_id", Integer),
    Column("title", String(150)),
    Column("notes", Text),
    Column("study_date", Date),
    Column("created_at", DateTime),
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

class LearningLogDeleteResponse(BaseModel):
    message: str
    deleted_log: LearningLogRead

@router.get("", response_model=list[LearningLogRead])
def get_learning_logs(
    user_id: int | None = None,
    topic_id: int | None = None,
    search: str | None = None,
):
    with engine.connect() as connection:
        query = select(learning_logs_table).order_by(learning_logs_table.c.id)
        
        if user_id is not None:
            query = query.where(learning_logs_table.c.user_id == user_id)
            
        if topic_id is not None:
            query = query.where(learning_logs_table.c.topic_id == topic_id)
            
        if search is not None and search.strip():
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    learning_logs_table.c.title.ilike(search_pattern),
                    learning_logs_table.c.notes.ilike(search_pattern),
                )
            )
            
        result = connection.execute(query)
        logs = result.mappings().all()
        return [dict(log) for log in logs]

@router.post("", response_model=LearningLogRead, status_code=status.HTTP_201_CREATED)
def create_learning_log(log: LearningLogCreate):
    with engine.begin() as connection:
        query = (
            insert(learning_logs_table)
            .values(
                user_id=log.user_id,
                topic_id=log.topic_id,
                title=log.title,
                notes=log.notes,
            )
            .returning(
                learning_logs_table.c.id,
                learning_logs_table.c.user_id,
                learning_logs_table.c.topic_id,
                learning_logs_table.c.title,
                learning_logs_table.c.notes,
                learning_logs_table.c.study_date,
                learning_logs_table.c.created_at,
            )
        )
        result = connection.execute(query)
        created_log = result.mappings().one()
        return dict(created_log)

@router.get("/{log_id}", response_model=LearningLogRead)
def get_learning_log(log_id: int):
    with engine.connect() as connection:
        query = select(learning_logs_table).where(learning_logs_table.c.id == log_id)
        result = connection.execute(query)
        log = result.mappings().first()
        
        if log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
            
        return dict(log)

@router.patch("/{log_id}", response_model=LearningLogRead)
def update_learning_log(log_id: int, log: LearningLogUpdate):
    update_data = log.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    query = (
        update(learning_logs_table)
        .where(learning_logs_table.c.id == log_id)
        .values(**update_data)
        .returning(
            learning_logs_table.c.id,
            learning_logs_table.c.user_id,
            learning_logs_table.c.topic_id,
            learning_logs_table.c.title,
            learning_logs_table.c.notes,
            learning_logs_table.c.study_date,
            learning_logs_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        updated_log = result.mappings().first()
        
        if updated_log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
            
        return dict(updated_log)

@router.delete("/{log_id}", response_model=LearningLogDeleteResponse)
def delete_learning_log(log_id: int):
    query = (
        delete(learning_logs_table)
        .where(learning_logs_table.c.id == log_id)
        .returning(
            learning_logs_table.c.id,
            learning_logs_table.c.user_id,
            learning_logs_table.c.topic_id,
            learning_logs_table.c.title,
            learning_logs_table.c.notes,
            learning_logs_table.c.study_date,
            learning_logs_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        deleted_log = result.mappings().first()
        
        if deleted_log is None:
            raise HTTPException(status_code=404, detail="Learning log not found")
            
        return {
            "message": "Learning log deleted successfully",
            "deleted_log": dict(deleted_log)
        }