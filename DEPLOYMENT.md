# Epsilon Resource Planner - Cloud Deployment Guide

This guide provides step-by-step instructions for deploying the Epsilon Resource Planner to cloud platforms using Apache web server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Configuration Overview](#configuration-overview)
- [Step 1: Prepare Your Cloud Server](#step-1-prepare-your-cloud-server)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Configure Oracle Database](#step-3-configure-oracle-database)
- [Step 4: Configure Backend](#step-4-configure-backend)
- [Step 5: Configure Frontend](#step-5-configure-frontend)
- [Step 6: Build Frontend](#step-6-build-frontend)
- [Step 7: Configure Apache](#step-7-configure-apache)
- [Step 8: Deploy Application](#step-8-deploy-application)
- [Step 9: Verify Deployment](#step-9-verify-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Cloud Server**: Linux-based server (Ubuntu 20.04+ recommended)
- **Web Server**: Apache 2.4+
- **Python**: Python 3.8+
- **Node.js**: Node.js 16+ and npm
- **Database**: Oracle Database (on-premise or cloud RDS)

### Required Knowledge
- Basic Linux command line
- SSH access to your cloud server
- Domain name configured to point to your server (recommended)

### Access Requirements
- SSH access to cloud server
- Oracle database credentials
- Domain or IP address for your deployment

---

## Configuration Overview

The application uses environment variables for all deployment-specific settings:

### Backend Configuration
- **DATABASE_URL**: Oracle database connection string
- **BACKEND_HOST**: Host to bind the backend server
- **BACKEND_PORT**: Port for the backend server
- **ALLOWED_ORIGINS**: Comma-separated list of allowed frontend origins (for CORS)

### Frontend Configuration
- **VITE_API_BASE_URL**: URL where the backend API is accessible

---

## Step 1: Prepare Your Cloud Server

### 1.1 Connect to Your Server
```bash
ssh username@your-server-ip
```

### 1.2 Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Create Application Directory
```bash
sudo mkdir -p /var/www/epsilon-resource-planner
sudo chown $USER:$USER /var/www/epsilon-resource-planner
cd /var/www/epsilon-resource-planner
```

### 1.4 Upload Your Code
Upload your project files to the server using one of these methods:

**Option A: Git Clone**
```bash
git clone <your-repository-url> .
```

**Option B: SCP from Local Machine**
```bash
# Run this from your local machine
scp -r /path/to/epsilon-resource-planner username@your-server-ip:/var/www/epsilon-resource-planner/
```

---

## Step 2: Install Dependencies

### 2.1 Install Python and Required Packages
```bash
sudo apt install -y python3 python3-pip python3-venv
```

### 2.2 Install Oracle Instant Client
```bash
# Download Oracle Instant Client (adjust version as needed)
cd /opt
sudo wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64.zip
sudo unzip instantclient-basic-linux.x64.zip
sudo sh -c "echo /opt/instantclient_21_X > /etc/ld.so.conf.d/oracle-instantclient.conf"
sudo ldconfig
```

### 2.3 Install Backend Python Dependencies
```bash
cd /var/www/epsilon-resource-planner/backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors sqlalchemy oracledb
```

### 2.4 Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2.5 Install Apache and mod_wsgi
```bash
sudo apt install -y apache2 libapache2-mod-wsgi-py3
```

---

## Step 3: Configure Oracle Database

### 3.1 Prepare Database Connection String
Format: `oracle+oracledb://username:password@host:port/?service_name=service`

Example:
```
oracle+oracledb://epsilon_user:SecurePass123@oracle-db.cloud.com:1521/?service_name=ORCL
```

### 3.2 Create Database Tables (if not already created)
Connect to your Oracle database and create the required tables. Use the SQL schema from your project documentation or existing database setup scripts.

---

## Step 4: Configure Backend

### 4.1 Create Backend Environment File
```bash
cd /var/www/epsilon-resource-planner/backend
cp .env.example .env
nano .env
```

### 4.2 Update Backend Configuration
Edit the `.env` file with your production values:

```bash
# Database Configuration
DATABASE_URL=oracle+oracledb://your_user:your_password@your-db-host:1521/?service_name=ORCL

# Server Configuration (for standalone mode, not needed with Apache/WSGI)
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# CORS Configuration - IMPORTANT: Update with your actual domain
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 4.3 Load Environment Variables
```bash
# Option A: Use the config script
cp ../config.example.sh ../config.sh
nano ../config.sh  # Edit with your values
source ../config.sh

# Option B: Export manually
export DATABASE_URL="your_connection_string"
export ALLOWED_ORIGINS="https://your-domain.com"
```

### 4.4 Test Backend Connection
```bash
cd /var/www/epsilon-resource-planner/backend
source venv/bin/activate
python backend.py
# Should start without errors - press Ctrl+C to stop
```

---

## Step 5: Configure Frontend

### 5.1 Create Frontend Environment File
```bash
cd /var/www/epsilon-resource-planner/frontend
cp .env.example .env
nano .env
```

### 5.2 Update Frontend Configuration
Edit the `.env` file with your backend URL:

```bash
# Backend API URL
VITE_API_BASE_URL=https://your-domain.com/api
```

**Important**: The `VITE_API_BASE_URL` should point to where your Flask backend is accessible from the internet.

Common configurations:
- Same domain: `https://your-domain.com/api`
- Subdomain: `https://api.your-domain.com`
- Different port: `https://your-domain.com:8000`

---

## Step 6: Build Frontend

### 6.1 Install Frontend Dependencies
```bash
cd /var/www/epsilon-resource-planner/frontend
npm install
```

### 6.2 Build Production Bundle
```bash
# Make sure environment variables are loaded
source ../config.sh  # If using config script

# Build the application
npm run build
```

This creates optimized production files in the `frontend/dist` directory.

---

## Step 7: Configure Apache

### 7.1 Create Apache Virtual Host Configuration
```bash
sudo nano /etc/apache2/sites-available/epsilon-resource-planner.conf
```

### 7.2 Add Virtual Host Configuration
Copy and modify the following configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    ServerAdmin admin@your-domain.com

    # Frontend - Serve React build
    DocumentRoot /var/www/epsilon-resource-planner/frontend/dist
    
    <Directory /var/www/epsilon-resource-planner/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router - redirect all requests to index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Backend - WSGI Python Application
    WSGIDaemonProcess epsilon_backend python-home=/var/www/epsilon-resource-planner/backend/venv python-path=/var/www/epsilon-resource-planner/backend
    WSGIProcessGroup epsilon_backend
    WSGIScriptAlias /api /var/www/epsilon-resource-planner/backend/app.wsgi

    <Directory /var/www/epsilon-resource-planner/backend>
        <Files app.wsgi>
            Require all granted
        </Files>
    </Directory>

    # Set environment variables for Python application
    SetEnv DATABASE_URL "oracle+oracledb://user:pass@host:1521/?service_name=ORCL"
    SetEnv ALLOWED_ORIGINS "https://your-domain.com,https://www.your-domain.com"

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/epsilon-error.log
    CustomLog ${APACHE_LOG_DIR}/epsilon-access.log combined
</VirtualHost>
```

**Important**: Update the following in the configuration:
- `ServerName` and `ServerAlias` with your domain
- `SetEnv DATABASE_URL` with your actual database connection string
- `SetEnv ALLOWED_ORIGINS` with your actual domain(s)

### 7.3 Enable Required Apache Modules
```bash
sudo a2enmod rewrite
sudo a2enmod wsgi
sudo a2enmod headers
```

### 7.4 Enable the Site
```bash
sudo a2ensite epsilon-resource-planner.conf
sudo a2dissite 000-default.conf  # Disable default site (optional)
```

### 7.5 Test Apache Configuration
```bash
sudo apache2ctl configtest
```

Should return "Syntax OK". If there are errors, review the configuration file.

### 7.6 Restart Apache
```bash
sudo systemctl restart apache2
```

---

## Step 8: Deploy Application

### 8.1 Set Proper Permissions
```bash
cd /var/www/epsilon-resource-planner
sudo chown -R www-data:www-data backend/
sudo chown -R www-data:www-data frontend/dist/
sudo chmod -R 755 frontend/dist/
```

### 8.2 Verify WSGI File
Check that `backend/app.wsgi` exists and has correct content:

```bash
cat backend/app.wsgi
```

Should contain:
```python
import sys
import os

sys.path.insert(0, '/var/www/epsilon-resource-planner/backend')
os.chdir('/var/www/epsilon-resource-planner/backend')

from backend import app as application
```

### 8.3 Reload Apache
```bash
sudo systemctl reload apache2
```

---

## Step 9: Verify Deployment

### 9.1 Check Apache Status
```bash
sudo systemctl status apache2
```

Should show "active (running)".

### 9.2 Check Apache Error Logs
```bash
sudo tail -f /var/log/apache2/epsilon-error.log
```

Look for any errors. Press Ctrl+C to exit.

### 9.3 Test Backend API
```bash
curl http://your-domain.com/api/health
```

Should return:
```json
{"status": "healthy", "timestamp": "..."}
```

### 9.4 Test Frontend
Open your browser and navigate to:
```
http://your-domain.com
```

The application should load and be able to connect to the backend.

---

## Enable HTTPS (Recommended)

### Install Certbot for Let's Encrypt SSL
```bash
sudo apt install -y certbot python3-certbot-apache
```

### Obtain SSL Certificate
```bash
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure Apache for HTTPS.

### Update Frontend Configuration
After enabling HTTPS, update your frontend `.env`:
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

Rebuild and redeploy:
```bash
cd /var/www/epsilon-resource-planner/frontend
npm run build
sudo systemctl reload apache2
```

### Update Backend CORS
Update backend `.env` or Apache `SetEnv`:
```bash
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

---

## Troubleshooting

### Issue: Backend Not Responding

**Check Apache error logs:**
```bash
sudo tail -50 /var/log/apache2/epsilon-error.log
```

**Common causes:**
- Database connection failed - verify DATABASE_URL
- Python module import errors - check venv activation in WSGI
- Permission issues - ensure www-data can read files

**Resolution:**
```bash
# Test backend manually
cd /var/www/epsilon-resource-planner/backend
source venv/bin/activate
python backend.py
```

### Issue: Frontend Cannot Connect to Backend

**Check browser console for CORS errors:**
- Press F12 in browser
- Look for CORS-related errors

**Resolution:**
1. Verify ALLOWED_ORIGINS includes your frontend domain
2. Check that VITE_API_BASE_URL matches backend location
3. Rebuild frontend after changing .env: `npm run build`

### Issue: Database Connection Errors

**Check connection string format:**
```
oracle+oracledb://username:password@host:port/?service_name=service_name
```

**Test Oracle connectivity:**
```bash
# From Python
python3 -c "import oracledb; print('Oracle DB driver loaded successfully')"
```

**Common issues:**
- Incorrect credentials
- Firewall blocking port 1521
- Service name mismatch
- Oracle Instant Client not installed

### Issue: 404 Errors After Deployment

**Enable Apache rewrite module:**
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**Check .htaccess or RewriteRule in Apache config**

### Issue: Environment Variables Not Loading

**For Apache/WSGI**, set in VirtualHost:
```apache
SetEnv DATABASE_URL "your_value"
SetEnv ALLOWED_ORIGINS "your_origins"
```

**For standalone Python**, use .env file or:
```bash
export DATABASE_URL="your_value"
python backend.py
```

### Getting Help

**View all logs:**
```bash
# Apache error log
sudo tail -50 /var/log/apache2/epsilon-error.log

# Apache access log
sudo tail -50 /var/log/apache2/epsilon-access.log

# Check Apache status
sudo systemctl status apache2
```

---

## Maintenance

### Update Application Code
```bash
cd /var/www/epsilon-resource-planner
git pull origin main  # If using git

# Rebuild frontend
cd frontend
npm run build

# Restart Apache
sudo systemctl restart apache2
```

### Update Python Dependencies
```bash
cd /var/www/epsilon-resource-planner/backend
source venv/bin/activate
pip install --upgrade flask flask-cors sqlalchemy oracledb
```

### Monitor Application
```bash
# Watch Apache logs in real-time
sudo tail -f /var/log/apache2/epsilon-error.log
```

---

## Security Recommendations

1. **Never commit `.env` files** - Use `.env.example` templates only
2. **Use strong database passwords**
3. **Enable HTTPS** with Let's Encrypt (free SSL certificates)
4. **Restrict database access** to specific IP addresses
5. **Regular security updates**: `sudo apt update && sudo apt upgrade`
6. **Firewall configuration**: Only allow ports 80, 443, and SSH
7. **Regular backups** of database and uploaded files

---

## Quick Reference: Environment Variables

### Backend (`backend/.env`)
```bash
DATABASE_URL=oracle+oracledb://user:pass@host:1521/?service_name=ORCL
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ALLOWED_ORIGINS=https://your-domain.com
```

### Frontend (`frontend/.env`)
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

---

## Support

For additional help:
- Check the project README.md
- Review Apache documentation
- Check Oracle connection troubleshooting guides
- Verify all `.env` files are properly configured

---

**Epsilon Resource Planner v3.0**  
Cloud Deployment Guide  
Updated: 2026-01-04
