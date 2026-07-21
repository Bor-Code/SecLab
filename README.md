# SecLab

## Project Objective
SecLab is a learning tracking system developed for the engineering component of the internship.
The goal is to enable users to track their learning topics, work logs, and useful resources through a single web application.

## Technologies
**Backend:**
- Python
- FastAPI
- SQLAlchemy Core
- PostgreSQL
- Pydantic
- Swagger/OpenAPI

**Frontend:**
- React
- TypeScript
- Vite
- ESLint
- CSS

## Current Status
On the backend, a CRUD infrastructure has been set up for Users, Topics, Learning Logs, and Resources.

On the frontend:
- Listing, creating, editing, and deleting users
- Listing, creating, editing, and deleting topics
- Listing, creating, editing, and deleting learning logs
- Listing, creating, editing, and deleting resources
- Using dropdowns for user and topic selection

## API Endpoints
**Users:**
- `GET /users`
- `POST /users`
- `GET /users/{user_id}`
- `PATCH /users/{user_id}`
- `DELETE /users/{user_id}`

**Topics:**
- `GET /topics`
- `POST /topics`
- `GET /topics/{topic_id}`
- `PATCH /topics/{topic_id}`
- `DELETE /topics/{topic_id}`

**Learning Logs:**
- `GET /learning-logs`
- `POST /learning-logs`
- `GET /learning-logs/{log_id}`
- `PATCH /learning-logs/{log_id}`
- `DELETE /learning-logs/{log_id}`

**Resources:**
- `GET /resources`
- `POST /resources`
- `GET /resources/{resource_id}`
- `PATCH /resources/{resource_id}`
- `DELETE /resources/{resource_id}`

## Local Execution
Start PostgreSQL:

```powershell
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$pgData = "$env:USERPROFILE\postgres-data\seclab"
$pgLog = "$pgData\postgres-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
& "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog start
& "$pgBin\pg_isready.exe" -h localhost -p 5432 -U postgres
```

## Backend Validation

Backend router or API changes can be checked with the commands documented in:

- [Backend Validation](docs/backend-validation.md)