from fastapi import FastAPI
from app.routers import topics # Az önce oluşturduğumuz dosyayı çağırıyoruz

app = FastAPI()

# Topics router'ını ana uygulamaya dahil (include) ediyoruz
app.include_router(topics.router)

# Kök endpoint'imiz aynen kalıyor
@app.get("/")
def read_root():
    return {"message": "Hello World"}