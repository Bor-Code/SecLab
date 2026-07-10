import os

#.env dosyasını okuyabilmek için python-dotenv içinden load_dotenv çağır.
from dotenv import load_dotenv

#sqlalchemy içinden create_engine ve text çağır.
from sqlalchemy import create_engine, text

#load_dotenv() çalıştır. 
load_dotenv()

#"DATABASE_URL" adında bir değişken oluşturuyoruz ve .env içinden okumasını sağlarız.
DATABASE_URL = os.getenv("DATABASE_URL")

#DATABASE_URL boşsa program hata versin.
if not DATABASE_URL:
    raise ValueError("DATABASE_URL bulunamadı! Lütfen backend klasöründeki .env dosyanı kontrol edin.")

#"engine" adında bir değişken oluşturuyoruz ve create_engine içine DATABASE_URL'i veriyoruz.
engine = create_engine(DATABASE_URL)

#with engine.connect() ile bağlantıyı açıyoruz.
try:
    with engine.connect() as connection:
        #bağlantı içinde SELECT 1 sorgusu çalıştır.
        connection.execute(text("SELECT 1"))
        #her şey tamamsa "Veritabanı bağlantısı başarılı" mesajını döndürüyoruz.
        print("database connection ok")
        
#Hiç bir şekilde bağlantı kurulmazsa hata mesajı döndürülür.
except Exception as e:
    print(f"Veritabanına bağlanırken bir hata oluştu: {e}")