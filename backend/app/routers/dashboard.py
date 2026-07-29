from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.activity import get_recent_activity as load_recent_activity
from app.routers.users import users_table
from app.routers.topics import topics_table
from app.routers.learning_logs import learning_logs_table
from app.routers.resources import resources_table
from app.routers.auth import require_admin

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/summary")
def get_dashboard_summary(admin: dict = Depends(require_admin)):
    try:
        with engine.begin() as connection:
            users_count = connection.execute(select(func.count()).select_from(users_table)).scalar() or 0
            topics_count = connection.execute(select(func.count()).select_from(topics_table)).scalar() or 0
            logs_count = connection.execute(select(func.count()).select_from(learning_logs_table)).scalar() or 0
            resources_count = connection.execute(select(func.count()).select_from(resources_table)).scalar() or 0

            return {
                "users": users_count,
                "topics": topics_count,
                "learning_logs": logs_count,
                "resources": resources_count
            }
    except SQLAlchemyError as e:
        print(f"Database error in dashboard summary: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

@router.get("/recent-activity")
def get_recent_activity(admin: dict = Depends(require_admin)):
    return load_recent_activity()
