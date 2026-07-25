from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


class HealthStatus(BaseModel):
    status: str
    database: str
    checked_at_utc: datetime


@router.get("", response_model=HealthStatus)
def get_health_status():
    database_status = "connected"
    app_status = "ok"

    try:
        with engine.connect() as connection:
            connection.execute(text("select 1")).scalar()
    except SQLAlchemyError:
        database_status = "disconnected"
        app_status = "degraded"

    return HealthStatus(
        status=app_status,
        database=database_status,
        checked_at_utc=datetime.now(timezone.utc),
    )