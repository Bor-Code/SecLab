from fastapi import FastAPI
from app.routers import topics, learning_logs # Az önce oluşturduğumuz dosyayı çağırıyoruz

app = FastAPI()     

# Topics router'ını ana uygulamaya dahil (include) ediyoruz
app.include_router(topics.router)
app.include_router(learning_logs.router)
# Kök endpoint'imiz aynen kalıyor
@app.get("/")
def read_root():
    return {"message": "Hello World"}