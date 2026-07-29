from sqlalchemy import text
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.activity import get_recent_activity as load_recent_activity
from app.routers.users import users_table
from app.routers.topics import topics_table
from app.routers.learning_logs import learning_logs_table
from app.routers.resources import resources_table
from app.routers.auth import require_admin, require_signed_in_user

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



@router.get("/dashboard/user-workspace")
@router.get("/user-workspace")
def get_user_workspace(current_user: dict = Depends(require_signed_in_user)):
    user_id = current_user["id"]

    try:
        with engine.begin() as connection:
            topic_count = connection.execute(
                text("SELECT COUNT(*) FROM topics WHERE user_id = :user_id"),
                {"user_id": user_id},
            ).scalar_one()

            log_count = connection.execute(
                text("SELECT COUNT(*) FROM learning_logs WHERE user_id = :user_id"),
                {"user_id": user_id},
            ).scalar_one()

            resource_count = connection.execute(
                text("SELECT COUNT(*) FROM resources WHERE user_id = :user_id"),
                {"user_id": user_id},
            ).scalar_one()

            latest_topic = connection.execute(
                text("""
                    SELECT id, name, description, created_at
                    FROM topics
                    WHERE user_id = :user_id
                    ORDER BY created_at DESC
                    LIMIT 1
                """),
                {"user_id": user_id},
            ).mappings().first()

            latest_log = connection.execute(
                text("""
                    SELECT id, title, notes, study_date, created_at
                    FROM learning_logs
                    WHERE user_id = :user_id
                    ORDER BY study_date DESC, created_at DESC
                    LIMIT 1
                """),
                {"user_id": user_id},
            ).mappings().first()

            latest_resource = connection.execute(
                text("""
                    SELECT id, title, url, resource_type, notes, created_at
                    FROM resources
                    WHERE user_id = :user_id
                    ORDER BY created_at DESC
                    LIMIT 1
                """),
                {"user_id": user_id},
            ).mappings().first()

            active_days = connection.execute(
                text("""
                    SELECT COUNT(DISTINCT study_date)
                    FROM learning_logs
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id},
            ).scalar_one()

            rows = []

            if latest_topic:
                rows.append({
                    "id": f"topic-{latest_topic['id']}",
                    "type": "topic",
                    "title": "Latest topic",
                    "description": latest_topic["name"],
                    "created_at": latest_topic["created_at"],
                    "read": False,
                })

            if latest_log:
                rows.append({
                    "id": f"log-{latest_log['id']}",
                    "type": "learning_log",
                    "title": "Latest learning log",
                    "description": latest_log["title"],
                    "created_at": latest_log["created_at"],
                    "read": False,
                })

            if latest_resource:
                rows.append({
                    "id": f"resource-{latest_resource['id']}",
                    "type": "resource",
                    "title": "Latest resource",
                    "description": latest_resource["title"],
                    "created_at": latest_resource["created_at"],
                    "read": False,
                })

            total_records = topic_count + log_count + resource_count
            completion_score = min(100, (topic_count * 20) + (log_count * 25) + (resource_count * 20))

            return {
                "user": {
                    "id": current_user["id"],
                    "username": current_user["username"],
                    "email": current_user["email"],
                    "role": current_user["role"],
                    "created_at": current_user.get("created_at"),
                },
                "counts": {
                    "topics": topic_count,
                    "learning_logs": log_count,
                    "resources": resource_count,
                    "total_records": total_records,
                },
                "progress": {
                    "completion_score": completion_score,
                    "active_days": active_days,
                    "last_study_date": latest_log["study_date"] if latest_log else None,
                },
                "latest": {
                    "topic": dict(latest_topic) if latest_topic else None,
                    "learning_log": dict(latest_log) if latest_log else None,
                    "resource": dict(latest_resource) if latest_resource else None,
                },
                "activity": rows,
                "notifications": rows,
                "unread_notifications": len(rows),
            }
    except Exception as error:
        print(f"Database error in get_user_workspace: {error}")
        raise
