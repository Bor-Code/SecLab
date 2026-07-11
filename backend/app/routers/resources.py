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