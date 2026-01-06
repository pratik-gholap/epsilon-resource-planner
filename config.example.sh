#!/bin/bash
# Epsilon Resource Planner - Configuration Script for Cloud Deployment
# This script sets environment variables for Linux/Unix cloud servers
# Usage: source config.example.sh OR . config.example.sh

# =============================================================================
# IMPORTANT: Copy this file to config.sh and update with your actual values
# Then run: source config.sh
# =============================================================================

echo "Loading Epsilon Resource Planner configuration..."

# =============================================================================
# BACKEND CONFIGURATION
# =============================================================================

# Oracle Database Connection
# Update with your cloud database credentials
export DATABASE_URL="oracle+oracledb://epsilon_user:YourSecurePassword@your-cloud-db.com:1521/?service_name=ORCL"

# Backend Server Settings
# Use 0.0.0.0 to accept connections from all interfaces in cloud environment
export BACKEND_HOST="0.0.0.0"
export BACKEND_PORT="8000"

# CORS Configuration
# Update with your frontend domain(s), comma-separated
export ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# =============================================================================
# FRONTEND CONFIGURATION (for build-time)
# =============================================================================

# Backend API URL
# This should match where your Flask backend is accessible
export VITE_API_BASE_URL="https://your-domain.com/api"

# =============================================================================
# VERIFICATION
# =============================================================================

echo "Configuration loaded successfully!"
echo ""
echo "Backend Configuration:"
echo "  - Database: ${DATABASE_URL%@*}@***" # Hide connection string details
echo "  - Host: $BACKEND_HOST"
echo "  - Port: $BACKEND_PORT"
echo "  - Allowed Origins: $ALLOWED_ORIGINS"
echo ""
echo "Frontend Configuration:"
echo "  - API URL: $VITE_API_BASE_URL"
echo ""
echo "REMINDER: Never commit config.sh to version control!"
echo ""

# =============================================================================
# USAGE INSTRUCTIONS
# =============================================================================
# 
# 1. Copy this file:
#    cp config.example.sh config.sh
#
# 2. Edit config.sh with your actual values:
#    nano config.sh
#
# 3. Load the configuration:
#    source config.sh
#
# 4. Start your backend:
#    cd backend && python backend.py
#
# 5. Build your frontend (in a new terminal after sourcing config.sh):
#    cd frontend && npm run build
#
# =============================================================================
