from datetime import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, Text, delete, insert, select, update
from app.database import engine

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

metadata = MetaData()
resources_table = Table(
    "resources",
    metadata,
    Column("id", Integer),
    Column("user_id", Integer),
    Column("topic_id", Integer),
    Column("title", String(150)),
    Column("url", Text),
    Column("resource_type", String(50)),
    Column("notes", Text),
    Column("created_at", DateTime),
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

class ResourceDeleteResponse(BaseModel):
    message: str
    deleted_resource: ResourceRead

@router.get("", response_model=list[ResourceRead])
def get_resources(
    user_id: int | None = None,
    topic_id: int | None = None,
    resource_type: str | None = None,
):
    with engine.connect() as connection:
        query = select(resources_table).order_by(resources_table.c.id)
        
        if user_id is not None:
            query = query.where(resources_table.c.user_id == user_id)
            
        if topic_id is not None:
            query = query.where(resources_table.c.topic_id == topic_id)
            
        if resource_type is not None:
            query = query.where(resources_table.c.resource_type == resource_type)
            
        result = connection.execute(query)
        resources = result.mappings().all()
        return [dict(resource) for resource in resources]

@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(resource: ResourceCreate):
    with engine.begin() as connection:
        query = (
            insert(resources_table)
            .values(
                user_id=resource.user_id,
                topic_id=resource.topic_id,
                title=resource.title,
                url=resource.url,
                resource_type=resource.resource_type,
                notes=resource.notes,
            )
            .returning(
                resources_table.c.id,
                resources_table.c.user_id,
                resources_table.c.topic_id,
                resources_table.c.title,
                resources_table.c.url,
                resources_table.c.resource_type,
                resources_table.c.notes,
                resources_table.c.created_at,
            )
        )
        result = connection.execute(query)
        created_resource = result.mappings().one()
        return dict(created_resource)

@router.get("/{resource_id}", response_model=ResourceRead)
def get_resource(resource_id: int):
    with engine.connect() as connection:
        query = select(resources_table).where(resources_table.c.id == resource_id)
        result = connection.execute(query)
        resource = result.mappings().first()
        
        if resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        return dict(resource)

@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(resource_id: int, resource: ResourceUpdate):
    update_data = resource.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    query = (
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
            resources_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        updated_resource = result.mappings().first()
        
        if updated_resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        return dict(updated_resource)

@router.delete("/{resource_id}", response_model=ResourceDeleteResponse)
def delete_resource(resource_id: int):
    query = (
        delete(resources_table)
        .where(resources_table.c.id == resource_id)
        .returning(
            resources_table.c.id,
            resources_table.c.user_id,
            resources_table.c.topic_id,
            resources_table.c.title,
            resources_table.c.url,
            resources_table.c.resource_type,
            resources_table.c.notes,
            resources_table.c.created_at,
        )
    )
    
    with engine.begin() as connection:
        result = connection.execute(query)
        deleted_resource = result.mappings().first()
        
        if deleted_resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        return {
            "message": "Resource deleted successfully",
            "deleted_resource": dict(deleted_resource)
        }