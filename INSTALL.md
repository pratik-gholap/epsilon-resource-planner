# Installation Guide - Epsilon Resource Planner

Quick guide to install all dependencies for local development.

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Oracle Database**: Local or remote instance

## Backend Installation

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment
```bash
# Copy the example environment file
copy .env.example .env     # Windows
cp .env.example .env       # Linux/Mac

# Edit .env with your database credentials
notepad .env               # Windows
nano .env                  # Linux/Mac
```

### Step 5: Verify Installation
```bash
python backend.py
```

Backend should start on http://localhost:8000

---

## Frontend Installation

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Node Dependencies
```bash
npm install
```

This will install all dependencies listed in `package.json`:
- React 18.2.0
- Vite 4.4.5
- date-fns
- xlsx (for CSV export)
- And all dev dependencies

### Step 3: Configure Environment
```bash
# Copy the example environment file
copy .env.example .env     # Windows
cp .env.example .env       # Linux/Mac

# Edit .env with your backend URL
notepad .env               # Windows
nano .env                  # Linux/Mac
```

### Step 4: Start Development Server
```bash
npm run dev
```

Frontend should start on http://localhost:5173

---

## Complete Local Setup (Quick Start)

```bash
# 1. Backend Setup
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

pip install -r requirements.txt
copy .env.example .env         # Windows
cp .env.example .env           # Linux/Mac
# Edit .env with your settings
python backend.py

# 2. Frontend Setup (in a new terminal)
cd frontend
npm install
copy .env.example .env         # Windows
cp .env.example .env           # Linux/Mac
# Edit .env with your backend URL
npm run dev
```

---

## Dependency Lists

### Backend Dependencies (Python)
- `Flask` - Web framework
- `flask-cors` - CORS support
- `SQLAlchemy` - Database ORM
- `oracledb` - Oracle database driver
- `gunicorn` - Production WSGI server
- `uWSGI` - Alternative WSGI server
- `python-dotenv` - Environment variable management

### Frontend Dependencies (Node.js)
- `react` - UI framework
- `react-dom` - React DOM rendering
- `vite` - Build tool and dev server
- `date-fns` - Date manipulation
- `xlsx` - Excel/CSV handling
- `dotenv` - Environment variables
- Dev dependencies for building and linting

---

## Troubleshooting

### Backend Issues

**Issue: `pip install` fails**
```bash
# Upgrade pip first
python -m pip install --upgrade pip
# Then try again
pip install -r requirements.txt
```

**Issue: Oracle driver installation fails**
- Install Oracle Instant Client first
- Ensure Oracle libraries are in system PATH

**Issue: Module not found errors**
- Verify virtual environment is activated
- Check Python version: `python --version`

### Frontend Issues

**Issue: `npm install` fails**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Try again
npm install
```

**Issue: Port 5173 already in use**
```bash
# Use a different port
npm run dev -- --port 3000
```

**Issue: Environment variables not loading**
- Ensure .env file is in the frontend directory
- Restart the Vite dev server after changing .env
- Variable names must start with `VITE_`

---

## Next Steps

After installation:

1. **Configure Database**: Update `backend/.env` with your Oracle connection details
2. **Configure Backend URL**: Update `frontend/.env` with your backend URL
3. **Start Backend**: `python backend.py` from backend directory
4. **Start Frontend**: `npm run dev` from frontend directory
5. **Access Application**: Open http://localhost:5173 in your browser

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Additional Commands

### Backend
```bash
# Run in production mode
gunicorn -w 4 -b 0.0.0.0:8000 backend:app

# Run tests (if available)
pytest

# Freeze current dependencies
pip freeze > requirements.txt
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Update all dependencies
npm update
```

---

**Epsilon Resource Planner v3.0**  
Installation Guide
