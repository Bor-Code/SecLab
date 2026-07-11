from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)

@router.get("")
def get_resources():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM resources ORDER BY id")
        )
        resources = result.mappings().all()
        return [dict(resource) for resource in resources]