from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import Table, Column, Integer, String, Text, DateTime, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.activity import record_activity
from sqlalchemy import MetaData
from app.routers.auth import require_signed_in_user

router = APIRouter(
    prefix="/resources",
    tags=["Kaynaklar"]
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
    Column("resource_type", String(50), default="dokumantasyon"),
    Column("notes", Text),
    Column("created_at", DateTime, default=datetime.utcnow)
)


class ResourceUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    url: str | None = Field(None, min_length=1)
    resource_type: str | None = Field(None, min_length=1, max_length=50)
    notes: str | None = None

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
    url: str
    resource_type: str = "dokumantasyon"
    notes: str | None = None

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
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritaban? servisi kullan?lam?yor")

@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, current_user: dict = Depends(require_signed_in_user)):
    if current_user["role"] != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetkisiz eri?im")

    try:
        with engine.begin() as connection:
            insert_query = (
                insert(resources_table)
                .values(
                    user_id=payload.user_id,
                    topic_id=payload.topic_id,
                    title=payload.title.strip(),
                    url=payload.url.strip(),
                    resource_type=payload.resource_type,
                    notes=payload.notes
                )
                .returning(resources_table)
            )
            result = connection.execute(insert_query)
            return dict(result.mappings().one())
    except SQLAlchemyError as e:
        print(f"Database error in create_resource: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritaban? servisi kullan?lam?yor")

@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(resource_id: int, payload: ResourceUpdate, current_user: dict = Depends(require_signed_in_user)):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    try:
        with engine.begin() as connection:
            existing_query = select(resources_table).where(resources_table.c.id == resource_id)
            existing = connection.execute(existing_query).mappings().first()

            if not existing:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadı")

            if current_user["role"] != "admin" and existing["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetkisiz eri?im")

            update_query = (
                update(resources_table)
                .where(resources_table.c.id == resource_id)
                .values(**update_data)
                .returning(
                    resources_table.c.id,
                    resources_table.c.user_id,
                    resources_table.c.topic_id,
                    resources_table.c.title,
                    resources_table.c.url,
                    resources_table.c.resource_type,
                    resources_table.c.notes,
                    resources_table.c.created_at
                )
            )

            updated = connection.execute(update_query).mappings().first()
            record_activity("resource.update", "Kaynak g?ncellendi", f"Kaynak '{updated['title']}' g?ncellendi.")
            return dict(updated)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in update_resource: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritaban? servisi kullan?lam?yor")

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            check_query = select(resources_table).where(resources_table.c.id == resource_id)
            res = connection.execute(check_query).mappings().first()
            if not res:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadı")

            if current_user["role"] != "admin" and res["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetkisiz eri?im")

            delete_query = delete(resources_table).where(resources_table.c.id == resource_id)
            connection.execute(delete_query)
            record_activity("resource.delete", "Kaynak silindi", f"Kaynak id {resource_id} silindi.")
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_resource: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritaban? servisi kullan?lam?yor")


