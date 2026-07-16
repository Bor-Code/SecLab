from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/topics",
    tags=["Topics"]
)

class TopicCreate(BaseModel):
    user_id: int = Field(...)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None)

class TopicUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None)

class TopicRead(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=list[TopicRead])
def get_topics():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, user_id, name, description, created_at FROM topics ORDER BY id")
        )
        topics = result.mappings().all()
        return [dict(topic) for topic in topics]
    
@router.post("", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
def create_topic(topic: TopicCreate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                INSERT INTO topics (user_id, name, description)
                VALUES (:user_id, :name, :description)
                RETURNING id, user_id, name, description, created_at
            """),
            {
                "user_id": topic.user_id,
                "name": topic.name,
                "description": topic.description,
            }
        )
        created_topic = result.mappings().one()
        return dict(created_topic)
    
@router.get("/{topic_id}", response_model=TopicRead)
def get_topic(topic_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, user_id, name, description, created_at FROM topics WHERE id = :id"),
            {"id": topic_id}
        )
        topic = result.mappings().first()
        
        if topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return dict(topic)

@router.patch("/{topic_id}", response_model=TopicRead)
def update_topic(topic_id: int, topic: TopicUpdate):
    update_data = topic.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
    set_query = ",\n                ".join(set_clauses)
    
    with engine.begin() as connection:
        result = connection.execute(
            text(f"""
                UPDATE topics
                SET {set_query}
                WHERE id = :id
                RETURNING id, user_id, name, description, created_at
            """),
            {**update_data, "id": topic_id}
        )
        updated_topic = result.mappings().first()
        
        if updated_topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return dict(updated_topic)
    
@router.delete("/{topic_id}")
def delete_topic(topic_id: int):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                DELETE FROM topics
                WHERE id = :id
                RETURNING id, user_id, name, description, created_at
            """),
            {"id": topic_id}
        )
        deleted_topic = result.mappings().first()
        
        if deleted_topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return {
            "message": "Topic deleted successfully",
            "topic": dict(deleted_topic)
        }