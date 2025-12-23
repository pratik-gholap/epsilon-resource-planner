# Production Deployment Guide

This guide explains how to run and configure the application with the production changes (SQLAlchemy DB, uWSGI, and Nginx) and where to customize URLs.

## Components
- **Backend**: Flask app served by **uWSGI** (`backend/wsgi.py`, `backend/uwsgi.ini`).
- **Frontend**: React app built to static assets (`frontend/dist`).
- **Reverse Proxy**: **Nginx** serves the React build and proxies `/api` to the backend.

## Configuration (customizable URLs)
You can configure the backend, frontend, and Nginx URLs with environment variables or config files.

### Backend
- **Database URL** (required for production):
  - `DATABASE_URL` controls which database the backend connects to.
  - Example for Oracle (SQL*Plus / Oracle DB via SQLAlchemy):
    ```bash
    export DATABASE_URL="oracle+oracledb://user:password@host:1521/ORCLPDB1"
    ```
  - **SQLite is not supported.** You must supply a SQL*Plus/Oracle `DATABASE_URL`.

- **Backend bind address/port** (optional for dev):
  - `BACKEND_HOST` (default: `127.0.0.1`)
  - `BACKEND_PORT` (default: `8000`)

These are read in `backend/backend.py` and used by `start-backend.sh` / `start_script.sh`.

### Frontend
The React app uses a **relative** API base URL (`/api`) in `frontend/src/services/api.js`, so it inherits whatever domain/port Nginx is serving. This is recommended for production.

If you want to customize the frontend host/port for local dev:
- `FRONTEND_HOST` (default: `127.0.0.1`)
- `FRONTEND_PORT` (default: `4173`)

These are used by `start_script.sh` when launching `npm run dev`.

### Nginx
Edit `nginx/epsilon-resource-planner.conf`:
- `server_name` — set your public hostname (e.g., `planner.example.com`).
- `root` — path to your built frontend (`/var/www/epsilon-resource-planner/frontend/dist`).
- `proxy_pass` — backend upstream (default `http://127.0.0.1:8000`).

## Production Setup Steps

### 1) Build the frontend
```bash
cd frontend
npm install
npm run build
```
This creates `frontend/dist`.

### 2) Configure the backend
Set your database URL (example for Oracle):
```bash
export DATABASE_URL="oracle+oracledb://user:password@host:1521/ORCLPDB1"
```
(Optional) set backend bind/port:
```bash
export BACKEND_HOST=127.0.0.1
export BACKEND_PORT=8000
```

### 3) Run the backend with uWSGI
From `backend/`:
```bash
uwsgi --ini uwsgi.ini
```
The default `backend/uwsgi.ini` binds to `127.0.0.1:8000`.

### 3a) Initialize the Oracle schema (required)
The backend does **not** auto-create tables for Oracle. Run the schema script once:
```bash
sqlplus user/password@//host:1521/ORCLPDB1 @documentation/oracle-schema.sql
```

### 4) Configure and start Nginx
Copy or symlink the config:
```bash
sudo cp nginx/epsilon-resource-planner.conf /etc/nginx/conf.d/epsilon-resource-planner.conf
```
Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5) Verify
- Frontend: `http://your-domain/`
- Backend API: `http://your-domain/api/health`

## Notes
- For Oracle, install an Oracle DB driver compatible with SQLAlchemy (e.g., `oracledb`).
- `DATABASE_URL` can target any SQLAlchemy-supported database.
- SQLite schema initialization is skipped for non-SQLite databases; make sure your schema exists when using Oracle.
