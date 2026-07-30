import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing in environment variables.")

engine_options = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
else:
    engine_options["connect_args"] = {"connect_timeout": 5}

engine = create_engine(DATABASE_URL, **engine_options)

#database.py çalıştığı anda arka planda motoru çalıştırır ve hazırda bekletir.Dosya her seferinde 
#import edildiğinde otomatik bağlantı testi yapmaz.Bu sayede main.py her çalıştığında sorgu atılmaz
#ve maliyetten tasarruf sağlanmış olur.