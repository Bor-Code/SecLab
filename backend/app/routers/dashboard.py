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

class DashboardActivityItem(BaseModel):
    activity_type: str
    title: str
    description: str | None
    created_at: str

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

@router.get("/recent-activity", response_model=list[DashboardActivityItem])
def get_dashboard_recent_activity():
    items = []

    with engine.connect() as connection:
        users_query = select(users_table).order_by(users_table.c.created_at.desc()).limit(4)
        for row in connection.execute(users_query):
            items.append(
                DashboardActivityItem(
                    activity_type="user",
                    title=row.username,
                    description=row.email,
                    created_at=str(row.created_at),
                )
            )

        topics_query = select(topics_table).order_by(topics_table.c.created_at.desc()).limit(4)
        for row in connection.execute(topics_query):
            items.append(
                DashboardActivityItem(
                    activity_type="topic",
                    title=row.name,
                    description=row.description,
                    created_at=str(row.created_at),
                )
            )

        logs_query = select(learning_logs_table).order_by(learning_logs_table.c.created_at.desc()).limit(4)
        for row in connection.execute(logs_query):
            items.append(
                DashboardActivityItem(
                    activity_type="learning_log",
                    title=row.title,
                    description=row.notes,
                    created_at=str(row.created_at),
                )
            )

        resources_query = select(resources_table).order_by(resources_table.c.created_at.desc()).limit(4)
        for row in connection.execute(resources_query):
            items.append(
                DashboardActivityItem(
                    activity_type="resource",
                    title=row.title,
                    description=row.url,
                    created_at=str(row.created_at),
                )
            )

    items.sort(key=lambda item: item.created_at, reverse=True)
    return items[:8]