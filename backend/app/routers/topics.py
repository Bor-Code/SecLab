from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from pydantic import BaseModel
from app.database import engine

router = APIRouter(
    prefix="/topics",
    tags=["Topics"]
)

class TopicCreate(BaseModel):
    user_id: int
    name: str
    description: str | None = None

class TopicUpdate(BaseModel):
    name: str
    description: str | None = None

# Slash'ler kaldırıldı ("" kullanıldı)
@router.get("")
def get_topics():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, user_id, name, description, created_at FROM topics ORDER BY id")
        )
        topics = result.mappings().all()
        return [dict(topic) for topic in topics]
    
@router.post("", status_code=status.HTTP_201_CREATED)
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
    
@router.get("/{topic_id}")
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

@router.put("/{topic_id}")
def update_topic(topic_id: int, topic: TopicUpdate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                UPDATE topics
                SET name = :name,
                    description = :description
                WHERE id = :id
                RETURNING id, user_id, name, description, created_at
            """),
            {
                "id": topic_id,
                "name": topic.name,
                "description": topic.description,
            }
        )
        updated_topic = result.mappings().first()
        
        # Hata mesajı HTTPException'a çevrildi
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
        
        # Hata mesajı HTTPException'a çevrildi
        if deleted_topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return {
            "message": "Topic deleted successfully",
            "topic": dict(deleted_topic)
        }