from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, learning_logs, resources, topics, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(topics.router)
app.include_router(learning_logs.router)
app.include_router(users.router)
app.include_router(resources.router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}