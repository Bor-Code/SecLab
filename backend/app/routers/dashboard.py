from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
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
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.get("/recent-activity")
def get_recent_activity(admin: dict = Depends(require_admin)):
    try:
        with engine.begin() as connection:
            logs_query = (
                select(learning_logs_table)
                .order_by(learning_logs_table.c.created_at.desc())
                .limit(10)
            )
            logs = connection.execute(logs_query).mappings().all()

            resources_query = (
                select(resources_table)
                .order_by(resources_table.c.created_at.desc())
                .limit(10)
            )
            resources = connection.execute(resources_query).mappings().all()

            activity = [
                {
                    "activity_type": "learning_log",
                    "title": row["title"],
                    "description": row["notes"],
                    "created_at": row["created_at"],
                }
                for row in logs
            ]
            activity.extend(
                {
                    "activity_type": "resource",
                    "title": row["title"],
                    "description": row["notes"] or row["url"],
                    "created_at": row["created_at"],
                }
                for row in resources
            )

            return sorted(
                activity,
                key=lambda item: item["created_at"],
                reverse=True,
            )[:20]
    except SQLAlchemyError as e:
        print(f"Database error in dashboard recent activity: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")


@router.get("/user-workspace")
def get_user_workspace(
    current_user: dict = Depends(require_signed_in_user),
):
    user_id = current_user["id"]

    try:
        with engine.begin() as connection:
            topics_count = connection.execute(
                select(func.count())
                .select_from(topics_table)
                .where(topics_table.c.user_id == user_id)
            ).scalar() or 0
            logs_count = connection.execute(
                select(func.count())
                .select_from(learning_logs_table)
                .where(learning_logs_table.c.user_id == user_id)
            ).scalar() or 0
            resources_count = connection.execute(
                select(func.count())
                .select_from(resources_table)
                .where(resources_table.c.user_id == user_id)
            ).scalar() or 0

            active_days = connection.execute(
                select(
                    func.count(
                        func.distinct(learning_logs_table.c.study_date)
                    )
                ).where(learning_logs_table.c.user_id == user_id)
            ).scalar() or 0

            latest_topic = connection.execute(
                select(topics_table)
                .where(topics_table.c.user_id == user_id)
                .order_by(topics_table.c.created_at.desc())
                .limit(1)
            ).mappings().first()
            latest_log = connection.execute(
                select(learning_logs_table)
                .where(learning_logs_table.c.user_id == user_id)
                .order_by(learning_logs_table.c.created_at.desc())
                .limit(1)
            ).mappings().first()
            latest_resource = connection.execute(
                select(resources_table)
                .where(resources_table.c.user_id == user_id)
                .order_by(resources_table.c.created_at.desc())
                .limit(1)
            ).mappings().first()

            recent_topics = connection.execute(
                select(topics_table)
                .where(topics_table.c.user_id == user_id)
                .order_by(topics_table.c.created_at.desc())
                .limit(5)
            ).mappings().all()
            recent_logs = connection.execute(
                select(learning_logs_table)
                .where(learning_logs_table.c.user_id == user_id)
                .order_by(learning_logs_table.c.created_at.desc())
                .limit(5)
            ).mappings().all()
            recent_resources = connection.execute(
                select(resources_table)
                .where(resources_table.c.user_id == user_id)
                .order_by(resources_table.c.created_at.desc())
                .limit(5)
            ).mappings().all()

        total_records = topics_count + logs_count + resources_count
        completion_score = (
            (40 if topics_count else 0)
            + (40 if logs_count else 0)
            + (20 if resources_count else 0)
        )
        last_study_date = (
            latest_log["study_date"]
            if latest_log is not None
            else None
        )

        activity = [
            {
                "title": "Konu oluşturuldu",
                "description": row["name"],
                "created_at": row["created_at"],
            }
            for row in recent_topics
        ]
        activity.extend(
            {
                "title": "Öğrenme kaydı eklendi",
                "description": row["title"],
                "created_at": row["created_at"],
            }
            for row in recent_logs
        )
        activity.extend(
            {
                "title": "Kaynak kaydedildi",
                "description": row["title"],
                "created_at": row["created_at"],
            }
            for row in recent_resources
        )
        activity = sorted(
            activity,
            key=lambda item: item["created_at"],
            reverse=True,
        )[:10]

        return {
            "user": {
                "username": current_user["username"],
                "email": current_user["email"],
                "role": current_user["role"],
            },
            "counts": {
                "topics": topics_count,
                "learning_logs": logs_count,
                "resources": resources_count,
                "total_records": total_records,
            },
            "progress": {
                "completion_score": completion_score,
                "active_days": active_days,
                "last_study_date": last_study_date,
            },
            "latest": {
                "topic": dict(latest_topic) if latest_topic else None,
                "learning_log": dict(latest_log) if latest_log else None,
                "resource": (
                    dict(latest_resource)
                    if latest_resource
                    else None
                ),
            },
            "activity": activity,
        }
    except SQLAlchemyError as error:
        print(f"Database error in user workspace: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Çalışma alanı verileri yüklenemedi",
        )
