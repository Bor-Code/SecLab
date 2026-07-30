from datetime import datetime, date
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Table, Column, Integer, String, Text, Date, DateTime, insert, select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from sqlalchemy import MetaData
from app.routers.auth import require_signed_in_user
from app.routers.topics import topics_table
from app.validation import strip_optional_text, strip_required_text

router = APIRouter(
    prefix="/learning-logs",
    tags=["Learning Logs"]
)

metadata = MetaData()

learning_logs_table = Table(
    "learning_logs",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=False),
    Column("topic_id", Integer, nullable=False),
    Column("title", String(150), nullable=False),
    Column("notes", Text),
    Column("study_date", Date, default=datetime.utcnow),
    Column("created_at", DateTime, default=datetime.utcnow)
)

class LearningLogRead(BaseModel):
    id: int
    user_id: int
    topic_id: int
    title: str
    notes: str | None
    study_date: date | None
    created_at: datetime

    class Config:
        from_attributes = True

class LearningLogCreate(BaseModel):
    user_id: int
    topic_id: int
    title: str = Field(..., min_length=1, max_length=150)
    notes: str | None = None
    study_date: date | None = None

    _strip_title = field_validator("title", mode="before")(strip_required_text)
    _strip_notes = field_validator("notes", mode="before")(strip_optional_text)

class LearningLogUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    notes: str | None = None
    study_date: date | None = None

    _strip_title = field_validator("title", mode="before")(strip_required_text)
    _strip_notes = field_validator("notes", mode="before")(strip_optional_text)

@router.get("", response_model=list[LearningLogRead])
def get_learning_logs(user_id: int | None = Query(None), current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            query = select(learning_logs_table)
            if current_user["role"] != "admin":
                query = query.where(learning_logs_table.c.user_id == current_user["id"])
            elif user_id is not None:
                query = query.where(learning_logs_table.c.user_id == user_id)

            result = connection.execute(query)
            return [dict(row) for row in result.mappings()]
    except SQLAlchemyError as e:
        print(f"Database error in get_learning_logs: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.post("", response_model=LearningLogRead, status_code=status.HTTP_201_CREATED)
def create_learning_log(payload: LearningLogCreate, current_user: dict = Depends(require_signed_in_user)):
    if current_user["role"] != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

    try:
        with engine.begin() as connection:
            topic_owner_id = connection.execute(
                select(topics_table.c.user_id).where(
                    topics_table.c.id == payload.topic_id
                )
            ).scalar_one_or_none()

            if topic_owner_id is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Konu bulunamadı"
                )

            if topic_owner_id != payload.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Seçilen konu bu kullanıcıya ait değil"
                )

            insert_query = (
                insert(learning_logs_table)
                .values(
                    user_id=payload.user_id,
                    topic_id=payload.topic_id,
                    title=payload.title,
                    notes=payload.notes,
                    study_date=payload.study_date or datetime.utcnow().date()
                )
                .returning(learning_logs_table)
            )
            result = connection.execute(insert_query)
            return dict(result.mappings().one())
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in create_learning_log: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")

@router.patch("/{log_id}", response_model=LearningLogRead)
def update_learning_log(
    log_id: int,
    payload: LearningLogUpdate,
    current_user: dict = Depends(require_signed_in_user),
):
    update_data = {}

    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.notes is not None:
        update_data["notes"] = payload.notes
    if payload.study_date is not None:
        update_data["study_date"] = payload.study_date

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncellenecek alan bulunamadı"
        )

    try:
        with engine.begin() as connection:
            learning_log = connection.execute(
                select(learning_logs_table).where(
                    learning_logs_table.c.id == log_id
                )
            ).mappings().first()

            if learning_log is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Öğrenme kaydı bulunamadı"
                )

            if (
                current_user["role"] != "admin"
                and learning_log["user_id"] != current_user["id"]
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bu işlem için yetkiniz yok"
                )

            updated_log = connection.execute(
                update(learning_logs_table)
                .where(learning_logs_table.c.id == log_id)
                .values(**update_data)
                .returning(learning_logs_table)
            ).mappings().one()

        return dict(updated_log)
    except HTTPException:
        raise
    except SQLAlchemyError as error:
        print(f"Database error in update_learning_log: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Veritabanı servisi kullanılamıyor"
        )


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_log(log_id: int, current_user: dict = Depends(require_signed_in_user)):
    try:
        with engine.begin() as connection:
            check_query = select(learning_logs_table).where(learning_logs_table.c.id == log_id)
            log = connection.execute(check_query).mappings().first()
            if not log:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Öğrenme kaydı bulunamadı")

            if current_user["role"] != "admin" and log["user_id"] != current_user["id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için yetkiniz yok")

            delete_query = delete(learning_logs_table).where(learning_logs_table.c.id == log_id)
            connection.execute(delete_query)
            return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        print(f"Database error in delete_learning_log: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Veritabanı servisi kullanılamıyor")


