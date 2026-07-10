from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine

app = FastAPI()

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