# SecLab

SecLab is a learning-tracking application built with FastAPI, PostgreSQL, React, and Vite. It provides separate administrator and user workspaces, JWT authentication, profile management, learning topics, study logs, resources, dashboard summaries, and a demo password-reset flow.

## Technology Stack

### Backend

- Python and FastAPI
- SQLAlchemy Core
- PostgreSQL
- Pydantic
- JWT authentication

### Frontend

- React
- Vite
- Material UI
- ESLint and Prettier

## Local Setup

### 1. Database

Create a PostgreSQL database named `seclab`, then run:

```powershell
psql -U postgres -d seclab -f .\docs\schema.sql
```

### 2. Backend

```powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/seclab
SECLAB_JWT_SECRET=replace_with_a_long_random_secret
SECLAB_TOKEN_EXPIRE_MINUTES=60
SECLAB_RESET_TOKEN_EXPIRE_MINUTES=15
SECLAB_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

Swagger UI is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend

```powershell
cd .\frontend
npm install
npm run start
```

The frontend uses `http://127.0.0.1:8000` by default. Override it with `VITE_API_BASE_URL` in `frontend/.env` when necessary.

## Main API Routes

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Administrator

- `GET /users`
- `POST /users`
- `GET /users/{user_id}`
- `PATCH /users/{user_id}`
- `DELETE /users/{user_id}`
- `POST /users/{user_id}/reset-password`
- `GET /dashboard/summary`
- `GET /dashboard/recent-activity`

### User Records

- `GET`, `POST /topics`
- `PATCH`, `DELETE /topics/{topic_id}`
- `GET`, `POST /learning-logs`
- `PATCH`, `DELETE /learning-logs/{log_id}`
- `GET`, `POST /resources`
- `PATCH`, `DELETE /resources/{resource_id}`
- `GET /dashboard/user-workspace`

Normal users can access only their own records. Administrator-only routes are protected by backend authorization checks.

## Validation

```powershell
cd .\frontend
npm run lint
npm run build
```

Backend validation notes are available in [docs/backend-validation.md](docs/backend-validation.md).

## Security Notes

- Never commit or share `backend/.env`.
- Use a long, random `SECLAB_JWT_SECRET` outside local development.
- Password-reset tokens become invalid after a successful password change.
- Existing access tokens are invalidated when the account password changes.
- The current password-reset interface displays the token for demonstration purposes; production email delivery is not implemented.
