from datetime import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

class ResourceCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str = Field(..., min_length=1, max_length=150)
    url: str = Field(..., min_length=1)
    resource_type: str = Field(..., min_length=1, max_length=50)
    notes: str | None = Field(default=None)

class ResourceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    url: str | None = Field(default=None, min_length=1)
    resource_type: str | None = Field(default=None, min_length=1, max_length=50)
    notes: str | None = Field(default=None)

class ResourceRead(BaseModel):
    id: int
    user_id: int
    topic_id: int
    title: str
    url: str
    resource_type: str
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=list[ResourceRead])
def get_resources():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM resources ORDER BY id")
        )
        resources = result.mappings().all()
        return [dict(resource) for resource in resources]

@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
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

@router.get("/{resource_id}", response_model=ResourceRead)
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

@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(resource_id: int, resource: ResourceUpdate):
    update_data = resource.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
    set_query = ",\n                ".join(set_clauses)
    
    with engine.begin() as connection:
        result = connection.execute(
            text(f"""
                UPDATE resources
                SET {set_query}
                WHERE id = :resource_id
                RETURNING *
            """),
            {**update_data, "resource_id": resource_id}
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