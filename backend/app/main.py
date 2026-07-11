from fastapi import FastAPI
from app.routers import topics, learning_logs

app = FastAPI()     

app.include_router(topics.router)
app.include_router(learning_logs.router)
@app.get("/")
def read_root():
    return {"message": "Hello World"}