# Production Deployment Guide

This guide explains how to run and configure the application with the production changes (SQLAlchemy DB, uWSGI, and Nginx) and where to customize URLs.

## Components
- **Backend**: Flask app served by **uWSGI** (`backend/wsgi.py`, `backend/uwsgi.ini`).
- **Frontend**: React app built to static assets (`frontend/dist`).
- **Reverse Proxy**: **Apache HTTPS** serves the React build and proxies `/api` to the backend.

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

### Apache HTTPS
Edit `apache/epsilon-resource-planner.conf`:
- `ServerName` — set your public hostname (e.g., `planner.example.com`).
- `DocumentRoot` — path to your built frontend (`/var/www/epsilon-resource-planner/frontend/dist`).
- `ProxyPass` — backend upstream (default `http://127.0.0.1:8000`).
- `SSLCertificateFile` / `SSLCertificateKeyFile` — server certificate paths.
- `SSLCACertificateFile` — client CA for mTLS.

**Required Apache modules**: `ssl`, `proxy`, `proxy_http`, `rewrite`, `headers`, `ratelimit`.

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

### 4) Configure and start Apache
Copy or symlink the config:
```bash
sudo cp apache/epsilon-resource-planner.conf /etc/apache2/sites-available/epsilon-resource-planner.conf
sudo a2ensite epsilon-resource-planner
sudo a2enmod ssl proxy proxy_http rewrite headers ratelimit
```
Reload Apache:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

### 5) Verify
- Frontend: `https://your-domain/`
- Backend API: `https://your-domain/api/health`

## Windows local Apache HTTPS (no uWSGI)
If you are running locally on Windows and want Apache HTTPS with mTLS (no uWSGI), use Apache HTTP Server 2.4.x and run the Flask backend directly.

### 1) Install Apache as a Windows service
From an elevated PowerShell in your Apache `bin` folder:
```powershell
.\httpd.exe -k install -n "Apache2.4"
```
If you already installed Apache with a different service name, list it:
```powershell
sc query | Select-String -Pattern "Apache"
```
Start the service:
```powershell
net start "Apache2.4"
```
If you see `AH00436: No installed service named "Apache2.4"`, the service has not been installed yet—run the install command above first.

### 2) Configure Apache HTTPS + mTLS
Edit `apache/epsilon-resource-planner.conf` for Windows paths:
- `ServerName` (e.g., `resource-planner.local`)
- `DocumentRoot` (absolute path to `frontend/dist`)
- `SSLCertificateFile`, `SSLCertificateKeyFile` (ensure the files exist)
- `SSLCACertificateFile` (client CA for mTLS; ensure the file exists)
- `ProxyPass /api/` → `http://127.0.0.1:8000/api/`

If you use the default paths in the repo config, place certs at:
```
%APACHE_HOME%\conf\certs\resource-planner.crt
%APACHE_HOME%\conf\certs\resource-planner.key
%APACHE_HOME%\conf\certs\client-ca.crt
```

Ensure your `httpd.conf` includes the SSL module and the vhost config:
```
LoadModule ssl_module modules/mod_ssl.so
Include conf/extra/epsilon-resource-planner.conf
```

### 3) Run the backend directly (no uWSGI)
```powershell
cd backend
python backend.py
```
This binds to `127.0.0.1:8000` by default (`BACKEND_HOST`/`BACKEND_PORT` env vars override it).

### 4) Trust your local certs and verify
- Add a hosts entry:
  ```
  127.0.0.1 resource-planner.local
  ```
- Restart Apache after config changes:
  ```powershell
  .\httpd.exe -k restart -n "Apache2.4"
  ```
- Visit: `https://resource-planner.local/`
- API check: `https://resource-planner.local/api/health`

## Security Controls

### Mutual TLS (mTLS)
Enabled in `apache/epsilon-resource-planner.conf`:
- `SSLVerifyClient require`
- `SSLCACertificateFile` points to the client CA that signed client certificates.

### Rate limiting and throttling
Use Apache `mod_ratelimit` to cap bandwidth per connection:
- `SetOutputFilter RATE_LIMIT`
- `SetEnv rate-limit 400` (KB/s). Adjust to your needs.

For request-rate throttling, consider `mod_evasive` or `mod_security` at the Apache layer.

### CORS restriction
The backend reads `ALLOWED_ORIGINS` (comma-separated) to restrict CORS:
```bash
export ALLOWED_ORIGINS="https://resource-planner.example.com"
```

## Notes
- For Oracle, install an Oracle DB driver compatible with SQLAlchemy (e.g., `oracledb`).
- `DATABASE_URL` can target any SQLAlchemy-supported database.
- SQLite schema initialization is skipped for non-SQLite databases; make sure your schema exists when using Oracle.
