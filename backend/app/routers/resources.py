from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field, HttpUrl, field_validator
from sqlalchemy import Table, Column, Integer, String, Text, DateTime, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from sqlalchemy import MetaData
from app.routers.auth import require_signed_in_user
from app.routers.topics import topics_table
from app.validation import strip_optional_text, strip_required_text

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

metadata = MetaData()

resources_table = Table(
    "resources",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("topic_id", Integer, nullable=False),
    Column("title", String(150), nullable=False),
    Column("url", Text, nullable=False),
    Column("resource_type", String(50), default="documentation"),
    Column("notes", Text),
    Column("created_at", DateTime, default=datetime.utcnow)
)

class ResourceRead(BaseModel):
    id: int
    user_id: int
    topic_id: int
    title: str
    url: str
    resource_type: str | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class ResourceCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str = Field(..., min_length=1, max_length=150)
    url: HttpUrl
    resource_type: Literal[
        "documentation",
        "tool",
        "article",
        "video",
        "other",
    ] = "documentation"
    notes: str | None = None

    _strip_title = field_validator("title", mode="before")(strip_required_text)
    _strip_notes = field_validator("notes", mode="before")(strip_optional_text)


class ResourceUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    url: HttpUrl | None = None
    resource_type: Literal[
        "documentation",
        "tool",
        "article",
        "video",
        "other",
    ] | None = None
    notes: str | None = None

    _strip_title = field_validator("title", mode="before")(strip_required_text)
    _strip_notes = field_validator("notes", mode="before")(strip_optional_text)


@router.get("", response_model=list[ResourceRead])
def get_resources(user_id: int | None = Query(None), current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            query = select(resources_table)
            if current_user["role"] != "admin":
                query = query.where(resources_table.c.user_id == current_user["id"])
            elif user_id is not None:
                query = query.where(resources_table.c.user_id == user_id)

            result = connection.execute(query)
            return [dict(row) for row in result.mappings()]
    except SQLAlchemyError as e:
        print(f"Database error in get_resources: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, current_user: dict = Depends(require_signed_in_user)):
    if current_user["role"] != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

    try:
        with engine.begin() as connection:
            topic_owner_id = connection.execute(
                select(topics_table.c.user_id).where(
                    topics_table.c.id == payload.topic_id
                )
            ).scalar_one_or_none()

            if topic_owner_id is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Konu bulunamadı"
                )

            if topic_owner_id != payload.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Seçilen konu bu kullanıcıya ait değil"
                )

            insert_query = (
                insert(resources_table)
                .values(
                    user_id=payload.user_id,
                    topic_id=payload.topic_id,
                    title=payload.title,
                    url=str(payload.url),
                    resource_type=payload.resource_type,
                    notes=payload.notes
                )
                .returning(resources_table)
            )
            result = connection.execute(insert_query)
            return dict(result.mappings().one())
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in create_resource: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    current_user: dict = Depends(require_signed_in_user),
):
    update_data = {}

    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.url is not None:
        update_data["url"] = str(payload.url)
    if payload.resource_type is not None:
        update_data["resource_type"] = payload.resource_type
    if payload.notes is not None:
        update_data["notes"] = payload.notes

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncellenecek alan bulunamadı"
        )

    try:
        with engine.begin() as connection:
            resource = connection.execute(
                select(resources_table).where(
                    resources_table.c.id == resource_id
                )
            ).mappings().first()

            if resource is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Kaynak bulunamadı"
                )

            if (
                current_user["role"] != "admin"
                and resource["user_id"] != current_user["id"]
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bu işlem için yetkiniz yok"
                )

            updated_resource = connection.execute(
                update(resources_table)
                .where(resources_table.c.id == resource_id)
                .values(**update_data)
                .returning(resources_table)
            ).mappings().one()

        return dict(updated_resource)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in update_resource: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Veritabanı servisi kullanılamıyor"
        )


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            check_query = select(resources_table).where(resources_table.c.id == resource_id)
            res = connection.execute(check_query).mappings().first()
            if not res:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadı")

            if current_user["role"] != "admin" and res["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

            delete_query = delete(resources_table).where(resources_table.c.id == resource_id)
            connection.execute(delete_query)
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_resource: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")


