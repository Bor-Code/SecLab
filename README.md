# SecLab

## Project Purpose
SecLab is a tracking application designed to organize, manage, and log cybersecurity research, network security notes, and lab environments efficiently.

## Tech Stack
- **Backend Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Environment Management:** python-dotenv

## Current Backend Progress
The core FastAPI backend is up and running. It features a stable PostgreSQL database connection powered by SQLAlchemy, foundational `users` and `topics` tables, and a fully integrated CRUD API for topic management.

## Topics API Endpoints
- `GET /topics`
- `POST /topics`
- `GET /topics/{topic_id}`
- `PUT /topics/{topic_id}`
- `DELETE /topics/{topic_id}`

## Project Structure
```text
backend/
├── .env
└── app/
    ├── main.py
    ├── database.py
    └── routers/
        ├── __init__.py
        └── topics.py