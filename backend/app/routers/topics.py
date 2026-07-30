from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Table, Column, Integer, String, Text, DateTime, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from sqlalchemy import MetaData
from app.routers.auth import require_signed_in_user
from app.validation import strip_optional_text, strip_required_text

router = APIRouter(
    prefix="/topics",
    tags=["Topics"]
)

metadata = MetaData()

topics_table = Table(
    "topics",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("name", String(100), nullable=False),
    Column("description", Text),
    Column("created_at", DateTime, default=datetime.utcnow)
)

class TopicRead(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    user_id: int
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

    _strip_name = field_validator("name", mode="before")(strip_required_text)
    _strip_description = field_validator("description", mode="before")(strip_optional_text)

class TopicUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None

    _strip_name = field_validator("name", mode="before")(strip_required_text)
    _strip_description = field_validator("description", mode="before")(strip_optional_text)

@router.get("", response_model=list[TopicRead])
def get_topics(user_id: int | None = Query(None), current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            query = select(topics_table)
            if current_user["role"] != "admin":
                query = query.where(topics_table.c.user_id == current_user["id"])
            elif user_id is not None:
                query = query.where(topics_table.c.user_id == user_id)

            result = connection.execute(query)
            return [dict(row) for row in result.mappings()]
    except SQLAlchemyError as e:
        print(f"Database error in get_topics: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.post("", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
def create_topic(payload: TopicCreate, current_user: dict = Depends(require_signed_in_user)):
    if current_user["role"] != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

    try:
        with engine.begin() as connection:
            insert_query = (
                insert(topics_table)
                .values(user_id=payload.user_id, name=payload.name, description=payload.description)
                .returning(topics_table)
            )
            result = connection.execute(insert_query)
            return dict(result.mappings().one())
    except SQLAlchemyError as e:
        print(f"Database error in create_topic: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.patch("/{topic_id}", response_model=TopicRead)
def update_topic(topic_id: int, payload: TopicUpdate, current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            check_query = select(topics_table).where(topics_table.c.id == topic_id)
            topic = connection.execute(check_query).mappings().first()
            if not topic:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konu bulunamadı")

            if current_user["role"] != "admin" and topic["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

            update_data = {}
            if payload.name is not None:
                update_data["name"] = payload.name
            if payload.description is not None:
                update_data["description"] = payload.description

            if not update_data:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek alan bulunamadı")

            update_query = (
                update(topics_table)
                .where(topics_table.c.id == topic_id)
                .values(**update_data)
                .returning(topics_table)
            )
            result = connection.execute(update_query).mappings().first()
            return dict(result)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in update_topic: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            check_query = select(topics_table).where(topics_table.c.id == topic_id)
            topic = connection.execute(check_query).mappings().first()
            if not topic:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konu bulunamadı")

            if current_user["role"] != "admin" and topic["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

            delete_query = delete(topics_table).where(topics_table.c.id == topic_id)
            connection.execute(delete_query)
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_topic: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")



