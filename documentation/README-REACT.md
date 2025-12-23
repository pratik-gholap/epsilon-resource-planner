# Epsilon Resource Planner - React Edition

![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)
![Python](https://img.shields.io/badge/Python-3.7+-3776AB.svg?logo=python)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Professional resource planning tool for managing team allocations across projects, built with React and Python Flask.

## ✨ Features

### Core Functionality
- 📅 **Date-Based Assignments** - Flexible start/end dates for project allocations
- 📊 **Timeline View** - Visual monthly calendar showing team availability
- 🎨 **Heat Map** - Color-coded allocation levels (0-30%, 31-70%, 71-100%+)
- 🖱️ **Drag & Drop** - Move assignments between people and time periods
- 📈 **Percentage Allocation** - Assign team members from 1-100% to multiple projects
- ⚠️ **Over-Allocation Detection** - Automatic warnings when capacity exceeds 100%

### Data Management
- 👥 **Team Members** - Manage people with roles and skills
- 🏢 **Clients** - Track client companies and relationships
- 📊 **Projects** - Link projects to clients
- 📤 **CSV Bulk Upload** - Import data in bulk
- 📥 **Excel Export** - Export assignments to spreadsheet
- 💾 **SQLite Database** - Persistent local storage

### User Interface
- 🎯 **Collapsible Groups** - Organized sidebar by role and client
- 📄 **Pagination** - Handle large teams efficiently
- 🔍 **Jump to Current Month** - Quick navigation to present
- 📱 **Responsive Design** - Works on desktop and tablet
- 🌙 **Dark Theme** - Professional dark UI with Epsilon branding

## 🚀 Quick Start

### Prerequisites
- **Python 3.7+** with pip
- **Node.js 16+** with npm
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation & Setup

**Option 1: Automated Setup (Recommended)**
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Manual Setup**

1. **Backend Setup**
```bash
cd backend
pip install flask flask-cors --break-system-packages
python3 backend.py
```

2. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
resource-planner-react/
├── backend/                    # Python Flask API
│   ├── backend.py             # Main Flask application
│   ├── resource_planner.db    # SQLite database (auto-created)
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React Application
│   ├── public/
│   │   ├── index.html
│   │   └── epsilon-logo.png
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── layout/       # Header, Sidebar
│   │   │   ├── timeline/     # Timeline Grid, Cells
│   │   │   ├── modals/       # Add/Edit Dialogs
│   │   │   └── common/       # Reusable Components
│   │   ├── context/          # React Context (State)
│   │   ├── services/         # API Layer
│   │   ├── utils/            # Utilities (dates, colors)
│   │   ├── styles/           # Global CSS
│   │   ├── App.jsx           # Main Component
│   │   └── main.jsx          # Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── start.sh                    # Automated setup script
└── README.md                   # This file
```

## 🎯 Usage Guide

### Adding Team Members
1. Click the 👤 icon in the header
2. Enter name (e.g., "Sarah Chen")
3. Enter role (e.g., "Senior Consultant")
4. Click "Add"

### Creating Projects
1. Click the 🏢 icon to add a client first
2. Click the 📊 icon to add a project
3. Link project to the client
4. Click "Add"

### Assigning Resources
1. Click the 📅 icon in the header
2. Select team member and project
3. Choose start and end dates
4. Set allocation percentage (1-100%)
5. Click "Assign"

### Drag & Drop Scheduling
1. **Move Assignments**: Click and drag assignment cards to different people or time periods
2. **Quick Assignment**: Drag projects from sidebar directly onto timeline cells
3. **Instant Updates**: All changes save automatically to the database

### Bulk Upload
1. Click the 📤 icon
2. Select upload type (People, Clients, Projects, or Assignments)
3. Choose CSV file with correct format:

**People CSV:**
```csv
name,role
John Doe,Senior Consultant
Jane Smith,Project Manager
```

**Assignments CSV:**
```csv
personName,projectName,startDate,endDate,percentage
John Doe,Digital Transformation,2026-01-01,2026-01-31,100
Jane Smith,Cloud Migration,2026-01-15,2026-02-28,50
```

### Exporting Data
- Click 📥 icon to export all assignments to Excel
- File includes person, project, client, dates, and allocation %

## 🛠️ Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd backend
python3 backend.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Building for Production
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

### API Endpoints

All endpoints are prefixed with `/api`:

**People**
- `GET /api/people` - Get all people
- `POST /api/people` - Add person
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

**Clients**
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

**Projects**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Add project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Assignments**
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Add assignment
  - Body: `{personId, projectId, startDate, endDate, percentage}`
- `DELETE /api/assignments/:id` - Delete assignment

**Bulk Upload**
- `POST /api/bulk-upload/people`
- `POST /api/bulk-upload/clients`
- `POST /api/bulk-upload/projects`
- `POST /api/bulk-upload/assignments`

**Utility**
- `GET /api/health` - Health check
- `POST /api/clear-all` - Clear all data

## 🎨 Customization

### Changing Colors
Edit `frontend/src/styles/globals.css`:
```css
:root {
  --accent-primary: #f59e0b;     /* Primary accent (amber)  */
  --accent-secondary: #10b981;   /* Secondary (green) */
  --bg-primary: #0a0e14;         /* Dark background */
}
```

### Adding Features
1. Create new component in `frontend/src/components/`
2. Add API endpoint in `backend/backend.py`
3. Update context in `frontend/src/context/AppContext.jsx`

## 📊 Performance

- **React Virtual DOM** - Efficient UI updates
- **Pagination** - Handle 100+ team members
- **Lazy Loading** - Fast initial load
- **SQLite** - Local database, no external dependencies

## 🐛 Troubleshooting

### "Error connecting to server"
**Solution**: Ensure backend is running on port 5000
```bash
cd backend
python3 backend.py
```

### Port 5000 Already in Use
**Solution**: Kill existing process or change port
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Or change port in vite.config.js
```

### Frontend Won't Start
**Solution**: Clear node_modules and reinstall
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Data Not Persisting
**Solution**: Check database file exists
```bash
ls backend/resource_planner.db
# If missing, restart backend to recreate
```

## 📚 Documentation Files

- `REACT-MIGRATION-GUIDE.md` - Migration from vanilla JS
- `SETUP-GUIDE.md` - Original setup documentation
- `CHANGELOG.md` - Version history
- `FEATURES.txt` - Feature list

## 🤝 Contributing

This is an internal Epsilon tool. For bugs or feature requests, contact the development team.

## 📝 License

Internal use only - Epsilon Professional Services

## 🎓 Tech Stack

**Frontend**
- React 18.2
- Vite (build tool)
- XLSX (Excel export)
- date-fns (date utilities)

**Backend**
- Python 3.7+
- Flask (web framework)
- Flask-CORS (cross-origin support)
- SQLite 3 (database)

**No External APIs** - Everything runs locally!

## 🌟 Benefits Over Original

✅ **Component Reusability** - DRY principle, easier maintenance  
✅ **Better Performance** - Virtual DOM, optimized rendering  
✅ **Developer Experience** - Hot reload, better debugging  
✅ **Scalability** - Easy to add features and complexity  
✅ **Type Safety** - Optional TypeScript support  
✅ **Testing** - Component-level unit testing  
✅ **Modern Tooling** - Vite, ESLint, modern JavaScript  

---

**Built with ❤️ for Epsilon Professional Services**

*Version 3.0 - React Edition*
