from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, Text, delete, insert, select, update
from app.database import engine

router = APIRouter(
    prefix="/topics",
    tags=["Topics"]
)

metadata = MetaData()
topics_table = Table(
    "topics",
    metadata,
    Column("id", Integer),
    Column("user_id", Integer),
    Column("name", String(100)),
    Column("description", Text),
    Column("created_at", DateTime),
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
        query = select(topics_table).order_by(topics_table.c.id)
        result = connection.execute(query)
        topics = result.mappings().all()
        return [dict(topic) for topic in topics]
    
@router.post("", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
def create_topic(topic: TopicCreate):
    with engine.begin() as connection:
        query = (
            insert(topics_table)
            .values(
                user_id=topic.user_id,
                name=topic.name,
                description=topic.description,
            )
            .returning(
                topics_table.c.id,
                topics_table.c.user_id,
                topics_table.c.name,
                topics_table.c.description,
                topics_table.c.created_at,
            )
        )
        result = connection.execute(query)
        created_topic = result.mappings().one()
        return dict(created_topic)
    
@router.get("/{topic_id}", response_model=TopicRead)
def get_topic(topic_id: int):
    with engine.connect() as connection:
        query = select(topics_table).where(topics_table.c.id == topic_id)
        result = connection.execute(query)
        topic = result.mappings().first()
        
        if topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return dict(topic)

@router.patch("/{topic_id}", response_model=TopicRead)
def update_topic(topic_id: int, topic: TopicUpdate):
    update_data = topic.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    query = (
        update(topics_table)
        .where(topics_table.c.id == topic_id)
        .values(**update_data)
        .returning(
            topics_table.c.id,
            topics_table.c.user_id,
            topics_table.c.name,
            topics_table.c.description,
            topics_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        updated_topic = result.mappings().first()
        
        if updated_topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return dict(updated_topic)
    
@router.delete("/{topic_id}")
def delete_topic(topic_id: int):
    query = (
        delete(topics_table)
        .where(topics_table.c.id == topic_id)
        .returning(
            topics_table.c.id,
            topics_table.c.user_id,
            topics_table.c.name,
            topics_table.c.description,
            topics_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        deleted_topic = result.mappings().first()
        
        if deleted_topic is None:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return {
            "message": "Topic deleted successfully",
            "topic": dict(deleted_topic)
        }