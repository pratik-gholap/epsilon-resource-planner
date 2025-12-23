#!/usr/bin/env bash

# ===============================================================
#      Epsilon Resource Planner - Unix Setup
# ===============================================================

set -e  # exit on first error

echo "==============================================================="
echo "     Epsilon Resource Planner - Unix Setup"
echo "==============================================================="
echo

# Figure out the directory where this script lives (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Helper to open URL in browser (Linux/macOS) ---
open_url() {
  local url="$1"
  if command -v xdg-open &>/dev/null; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v open &>/dev/null; then
    open "$url" >/dev/null 2>&1 &
  else
    echo "Please open this URL in your browser: $url"
  fi
}

# --------------------
# Check Python
# --------------------
echo "Checking Python..."
if ! command -v python &>/dev/null && ! command -v python3 &>/dev/null; then
  echo "[ERROR] Python not found"
  exit 1
fi

# Prefer python, fallback to python3
if command -v python &>/dev/null; then
  PYTHON=python
else
  PYTHON=python3
fi
echo "[OK] Python found ($PYTHON)"

# --------------------
# Check Node.js
# --------------------
echo "Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "[ERROR] Node.js not found"
  exit 1
fi
echo "[OK] Node.js found"
echo "[OK] npm is included with Node.js"

echo
echo "==============================================================="
echo "Starting setup..."
echo "==============================================================="
echo

# --------------------
# Backend setup
# --------------------
echo "[1/4] Installing backend packages..."
cd "$SCRIPT_DIR/backend"
pip install flask flask-cors
echo

# --------------------
# Frontend setup
# --------------------
echo "[2/4] Installing frontend packages (2-3 minutes)..."
cd "$SCRIPT_DIR/frontend"
npm install
echo

# --------------------
# Start backend
# --------------------
echo "[3/4] Starting backend server..."

# Run backend in background
(
  cd "$SCRIPT_DIR/backend"
  echo "Backend starting..."
  echo "Running backend unit tests..."
  "$PYTHON" -m unittest discover -s tests -v
  echo "Backend tests passed."
  "$PYTHON" backend.py
) &

BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# --------------------
# Start frontend
# --------------------
echo "[4/4] Starting frontend server..."
echo
echo "==============================================================="
echo "                     SERVERS STARTING"
echo "==============================================================="
echo
echo "  Backend:  http://${BACKEND_HOST:-127.0.0.1}:${BACKEND_PORT:-8000} (running in background, PID: $BACKEND_PID)"
echo "  Frontend: http://${FRONTEND_HOST:-127.0.0.1}:${FRONTEND_PORT:-4173} (opening now...)"
echo
echo "  Press Ctrl+C to stop the frontend dev server."
echo "  Backend will stop when this shell exits (or kill PID $BACKEND_PID)."
echo
echo "==============================================================="
echo

# Open frontend URL in default browser
open_url "http://${FRONTEND_HOST:-127.0.0.1}:${FRONTEND_PORT:-4173}"

# Start frontend dev server in foreground
cd "$SCRIPT_DIR/frontend"
npm run dev -- --host "${FRONTEND_HOST:-127.0.0.1}" --port "${FRONTEND_PORT:-4173}"
