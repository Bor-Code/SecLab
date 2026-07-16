# SecLab

## Proje Amacı

SecLab, stajın Engineering tarafı için geliştirilen bir öğrenme kayıt sistemidir.

Amaç; kullanıcıları, öğrenme konularını, çalışma kayıtlarını ve faydalı kaynakları tek bir web uygulaması üzerinden takip edebilmektir.

## Teknolojiler

Backend:
- Python
- FastAPI
- SQLAlchemy Core
- PostgreSQL
- Pydantic
- Swagger/OpenAPI

Frontend:
- React
- TypeScript
- Vite
- ESLint
- CSS

## Mevcut Durum

Backend tarafında Users, Topics, Learning Logs ve Resources için CRUD altyapısı kuruldu.

Frontend tarafında:
- Kullanıcı listeleme ve oluşturma
- Topic listeleme, oluşturma, düzenleme ve silme
- Learning log listeleme ve oluşturma
- Resource listeleme ve oluşturma
- User ve topic seçimleri için dropdown kullanımı

## API Endpointleri

Users:
- `GET /users`
- `POST /users`
- `GET /users/{user_id}`
- `PATCH /users/{user_id}`
- `DELETE /users/{user_id}`

Topics:
- `GET /topics`
- `POST /topics`
- `GET /topics/{topic_id}`
- `PATCH /topics/{topic_id}`
- `DELETE /topics/{topic_id}`

Learning Logs:
- `GET /learning-logs`
- `POST /learning-logs`
- `GET /learning-logs/{log_id}`
- `PATCH /learning-logs/{log_id}`
- `DELETE /learning-logs/{log_id}`

Resources:
- `GET /resources`
- `POST /resources`
- `GET /resources/{resource_id}`
- `PATCH /resources/{resource_id}`
- `DELETE /resources/{resource_id}`

## Lokal Çalıştırma

PostgreSQL başlat:

```powershell
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$pgData = "$env:USERPROFILE\postgres-data\seclab"
$pgLog = "$pgData\postgres-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

& "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog start
& "$pgBin\pg_isready.exe" -h localhost -p 5432 -U postgres