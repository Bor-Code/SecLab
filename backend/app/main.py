from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
from pydantic import BaseModel

app = FastAPI()

class TopicCreate(BaseModel):
    user_id: int
    name: str
    description: str | None = None

@app.get("/")
def read_root():
      return {"message": "Hello World"}

@app.get("/topics")
def get_topics():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, user_id, name, description, created_at FROM topics ORDER BY id")
        )
        topics = result.mappings().all()
        return [dict(topic) for topic in topics]
    
@app.post("/topics")
def create_topic(topic: TopicCreate):
    with engine.begin() as connection:
        result = connection.execute(
            text("""
                INSERT INTO topics (user_id, name, description)
                VALUES (:user_id, :name, :description)
                RETURNING id, user_id, name, description, created_at
            """),
            {
                "user_id": topic.user_id,
                "name": topic.name,
                "description": topic.description,
            }
        )

        created_topic = result.mappings().one()
        return dict(created_topic)