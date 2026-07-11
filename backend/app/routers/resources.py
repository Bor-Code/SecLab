from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

class ResourceCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str
    url: str
    resource_type: str
    notes: str | None = None

class ResourceUpdate(BaseModel):
    title: str
    url: str
    resource_type: str
    notes: str | None = None

@router.get("")
def get_resources():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM resources ORDER BY id")
        )
        resources = result.mappings().all()
        return [dict(resource) for resource in resources]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_resource(resource: ResourceCreate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                INSERT INTO resources (user_id, topic_id, title, url, resource_type, notes)
                VALUES (:user_id, :topic_id, :title, :url, :resource_type, :notes)
                RETURNING *
            """),
            {
                "user_id": resource.user_id,
                "topic_id": resource.topic_id,
                "title": resource.title,
                "url": resource.url,
                "resource_type": resource.resource_type,
                "notes": resource.notes,
            }
        )
        created_resource = result.mappings().first()
        return dict(created_resource)

@router.get("/{resource_id}")
def get_resource(resource_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM resources WHERE id = :resource_id"),
            {"resource_id": resource_id}
        )
        resource = result.mappings().first()
        if resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
        return dict(resource)

@router.put("/{resource_id}")
def update_resource(resource_id: int, resource: ResourceUpdate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                UPDATE resources
                SET title = :title,
                    url = :url,
                    resource_type = :resource_type,
                    notes = :notes
                WHERE id = :resource_id
                RETURNING *
            """),
            {
                "resource_id": resource_id,
                "title": resource.title,
                "url": resource.url,
                "resource_type": resource.resource_type,
                "notes": resource.notes,
            }
        )
        updated_resource = result.mappings().first()
        if updated_resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
        return dict(updated_resource)

@router.delete("/{resource_id}")
def delete_resource(resource_id: int):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                DELETE FROM resources
                WHERE id = :resource_id
                RETURNING *
            """),
            {"resource_id": resource_id}
        )
        deleted_resource = result.mappings().first()
        if deleted_resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
        return {
            "message": "Resource deleted successfully",
            "deleted_resource": dict(deleted_resource)
        }