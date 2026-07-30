from collections import defaultdict, deque
import os
import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, dashboard, health, learning_logs, resources, topics, users

app = FastAPI()



AUTH_RATE_LIMIT_WINDOW_SECONDS = 60
AUTH_RATE_LIMIT_MAX_REQUESTS = 10
_auth_attempts = defaultdict(deque)


@app.middleware("http")
async def auth_rate_limit_middleware(request: Request, call_next):
    auth_paths = {
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/change-password",
    }
    path = request.url.path.rstrip("/")

    if request.method == "POST" and path in auth_paths:
        now = time.time()
        client_host = request.client.host if request.client else "unknown"
        key = f"{client_host}:{path}"
        attempts = _auth_attempts[key]

        while attempts and now - attempts[0] > AUTH_RATE_LIMIT_WINDOW_SECONDS:
            attempts.popleft()

        if len(attempts) >= AUTH_RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Çok fazla giriş denemesi yapıldı. Lütfen kısa süre sonra tekrar deneyin."}
            )

        attempts.append(now)

    return await call_next(request)
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "SECLAB_CORS_ORIGINS",
        (
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:5173,http://127.0.0.1:5173"
        ),
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(topics.router)
app.include_router(learning_logs.router)
app.include_router(users.router)
app.include_router(resources.router)

@app.get("/")
def read_root():
    return {"message": "SecLab API çalışıyor"}
