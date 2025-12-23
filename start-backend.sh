#!/bin/bash

echo "🚀 Starting Resource Planner Backend..."
echo ""
echo "📊 Database: ${DATABASE_URL:-<unset>}"
echo "🌐 API will be available at: http://${BACKEND_HOST:-127.0.0.1}:${BACKEND_PORT:-8000}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
echo "🧪 Running backend unit tests..."
python3 -m unittest discover -s backend/tests -v
echo ""
python3 backend.py
