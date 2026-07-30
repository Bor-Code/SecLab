from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, Text, insert, select
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine

metadata = MetaData()

activity_events_table = Table(
    "activity_events",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("activity_type", String(50), nullable=False),
    Column("title", String(150), nullable=False),
    Column("description", Text, nullable=True),
    Column("created_at", DateTime, default=lambda: datetime.now(timezone.utc), nullable=False),
)


def ensure_activity_table():
    metadata.create_all(engine, tables=[activity_events_table])


def record_activity(activity_type: str, title: str, description: str | None = None):
    try:
        ensure_activity_table()
        with engine.begin() as connection:
            connection.execute(
                insert(activity_events_table).values(
                    activity_type=activity_type,
                    title=title,
                    description=description,
                    created_at=datetime.now(timezone.utc),
                )
            )
    except SQLAlchemyError as error:
        print(f"Activity log error: {error}")


def get_recent_activity(limit: int = 25):
    ensure_activity_table()
    with engine.begin() as connection:
        rows = connection.execute(
            select(
                activity_events_table.c.activity_type,
                activity_events_table.c.title,
                activity_events_table.c.description,
                activity_events_table.c.created_at,
            )
            .order_by(activity_events_table.c.created_at.desc())
            .limit(limit)
        ).mappings().all()

    return [dict(row) for row in rows]
