from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/learning-logs",
    tags=["Learning Logs"]
)

@router.get("")
def get_learning_logs():
    with engine.connect() as connection:
        # learning_logs tablosundaki tüm kayıtları id sırasına göre çekiyoruz
        result = connection.execute(
            text("SELECT * FROM learning_logs ORDER BY id")
        )
        
        # Gelen veriyi eşleyip sözlük listesi haline getiriyoruz
        logs = result.mappings().all()
        return [dict(log) for log in logs]