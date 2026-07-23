from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select
from app.database import engine

from app.routers.learning_logs import learning_logs_table
from app.routers.resources import resources_table
from app.routers.topics import topics_table
from app.routers.users import users_table

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

class DashboardSummary(BaseModel):
    users_count: int
    topics_count: int
    learning_logs_count: int
    resources_count: int

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    with engine.connect() as connection:
        users_count = connection.execute(
            select(func.count()).select_from(users_table)
        ).scalar()
        
        topics_count = connection.execute(
            select(func.count()).select_from(topics_table)
        ).scalar()
        
        learning_logs_count = connection.execute(
            select(func.count()).select_from(learning_logs_table)
        ).scalar()
        
        resources_count = connection.execute(
            select(func.count()).select_from(resources_table)
        ).scalar()
        
        return DashboardSummary(
            users_count=users_count or 0,
            topics_count=topics_count or 0,
            learning_logs_count=learning_logs_count or 0,
            resources_count=resources_count or 0,
        )