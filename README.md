# Epsilon Resource Planner - Technical Reference

## 📋 Overview
Professional services resource planning tool for Epsilon with Python Flask backend and SQLite database.

**Version 3.0** - Date-Based Assignment System

## 🗄️ Database
- **Type**: SQLite (free, serverless, no setup required)
- **File**: `resource_planner.db` (created automatically)
- **Tables**: people, clients, projects, assignments (with date ranges)

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd /mnt/user-data/outputs
python3 backend.py
```

Or use the startup script:
```bash
./start-backend.sh
```

The backend will start on `http://localhost:5000`

### 2. Open the Frontend

Open `resource-planner.html` in your web browser.

## 📡 API Endpoints

### People
- `GET /api/people` - Get all people
- `POST /api/people` - Add person (body: {name, role})
- `DELETE /api/people/<id>` - Delete person

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add client (body: {name})
- `DELETE /api/clients/<id>` - Delete client

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Add project (body: {name, clientId})
- `DELETE /api/projects/<id>` - Delete project

### Assignments (Date-Based)
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Add assignment
  - Body: `{personId, projectId, startDate, endDate, percentage}`
  - Dates in YYYY-MM-DD format
- `DELETE /api/assignments/<id>` - Delete assignment

### Bulk Upload
- `POST /api/bulk-upload/people`
- `POST /api/bulk-upload/clients`
- `POST /api/bulk-upload/projects`
- `POST /api/bulk-upload/assignments`

### Utility
- `GET /api/health` - Health check
- `POST /api/clear-all` - Clear all data

## 🔧 Requirements

```bash
pip install flask flask-cors --break-system-packages
```

- Python 3.7+
- Flask
- Flask-CORS

## 📊 Database Schema

### people
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- role (TEXT)

### clients
- id (INTEGER, PRIMARY KEY)
- name (TEXT)

### projects
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- client_id (INTEGER, FOREIGN KEY)

### assignments
- id (INTEGER, PRIMARY KEY)
- person_id (INTEGER, FOREIGN KEY)
- project_id (INTEGER, FOREIGN KEY)
- start_date (TEXT) - YYYY-MM-DD
- end_date (TEXT) - YYYY-MM-DD
- percentage (INTEGER) - 1-100

## 📅 Date-Based Assignment System

Assignments use flexible date ranges:
- Any start and end date
- Assignment appears in all 2-week periods it overlaps
- Heat map calculated per period
- Drag & drop preserves duration

**Example:**
```
Assignment: 2026-01-05 to 2026-02-20
Spans periods: Jan 1-14, Jan 15-28, Jan 29-Feb 11, Feb 12-25
```

## 📤 CSV Format

### Assignments CSV
```csv
personName,projectName,startDate,endDate,percentage
John Doe,Project Alpha,2026-01-01,2026-01-31,100
Jane Smith,Project Beta,2026-01-15,2026-02-28,50
```

## ✨ Features

### Core Features
✅ Date-based assignments with calendar pickers
✅ Flexible date ranges (1 day to multiple months)
✅ Timeline view (2-week periods from Jan 2026)
✅ Drag & drop scheduling
✅ Percentage allocation (1-100%)
✅ Heat map visualization
✅ Over-allocation detection & warnings
✅ CSV bulk upload/export
✅ Real-time updates
✅ SQLite persistence
✅ REST API

### User Interface
✅ Epsilon branding with logo
✅ Professional dark theme
✅ Responsive design
✅ Intuitive date pickers
✅ Visual allocation indicators
✅ Color-coded heat map

## 🐛 Troubleshooting

**Frontend can't connect:**
- Ensure backend runs on port 5000
- Check browser console for CORS errors
- Verify API_BASE_URL in HTML

**Database errors:**
- Delete `resource_planner.db` to reset
- Check file permissions

**Date issues:**
- Use YYYY-MM-DD format
- End date must be >= start date

## 🔒 Production Notes

For production deployment:
- Add authentication/authorization
- Use HTTPS
- Switch to PostgreSQL/MySQL
- Add input validation
- Implement rate limiting
- Set up backup strategy

## 📚 Documentation

- `SETUP-GUIDE.md` - Complete setup instructions
- `V3-MIGRATION-GUIDE.md` - Version 3.0 changes
- `architecture.html` - System architecture
- `drag-drop-guide.html` - Feature guide
- `CHANGELOG.md` - Version history

---

**Epsilon Resource Planner v3.0**
Built with Python, Flask, SQLite, and Vanilla JavaScript
