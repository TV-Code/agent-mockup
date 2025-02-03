# Task Management System - Interview Assignment

A real-time task monitoring system built with React, FastAPI, and Three.js, featuring WebSocket communication and interactive 3D visualizations.

## Quick Setup

### Backend
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
# Important: --legacy-peer-deps is required due to Three.js dependencies
npm install --legacy-peer-deps
npm start
```

The application will be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Features
- Real-time task monitoring
- Interactive 3D visualization
- WebSocket communication
- Responsive design

## Tech Stack
- Frontend: React, TypeScript, Three.js
- Backend: Python, FastAPI
- Styling: TailwindCSS

## Notes
- Node.js v16+ and Python 3.8+ required
- The `--legacy-peer-deps` flag is necessary due to Three.js peer dependency conflicts
