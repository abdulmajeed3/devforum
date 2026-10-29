# DevForum — Deployment Guide

> **Reference only:** this guide documents how the system is designed to run. Deploying or operating this software requires prior written authorization under the [LICENSE](../LICENSE).

## Overview

DevForum consists of two applications that should be deployed separately:
- **Django API backend**: A Python WSGI/ASGI application
- **React frontend**: A static single-page application (SPA)

> **Note**: DevForum is a portfolio project and has not been deployed to production. This guide documents the intended deployment approach.

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- A web server (nginx recommended)
- A process manager (systemd, supervisor, or a PaaS)

## Backend Deployment

### 1. Environment Variables

Create a `.env` file with production values:

```env
SECRET_KEY=<long-random-string-min-50-chars>
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com
DB_NAME=devforum
DB_USER=devforum_user
DB_PASSWORD=<strong-password>
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourdomain.com
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
MEDIA_URL=/media/
MEDIA_ROOT=/var/www/devforum/media
```

### 2. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn  # production WSGI server
```

### 3. Collect Static Files

```bash
python manage.py collectstatic --no-input
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Start Gunicorn

```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --log-level info \
  --access-logfile /var/log/devforum/gunicorn-access.log \
  --error-logfile /var/log/devforum/gunicorn-error.log
```

### 6. Nginx Configuration (API)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location /media/ {
        alias /var/www/devforum/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    location /static/ {
        alias /var/www/devforum/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Frontend Deployment

### 1. Environment Variables

Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### 2. Build

```bash
cd frontend
npm ci
npm run build
```

This outputs optimized static files to `frontend/dist/`.

### 3. Nginx Configuration (SPA)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/devforum/dist;
    index index.html;

    # SPA: serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Production Django Settings

Additional recommended settings for production:

```python
# config/settings.py additions for production

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/var/log/devforum/django.log',
        },
    },
    'root': {
        'handlers': ['file'],
    },
}
```

## PaaS Options

### Railway / Render / Fly.io

These platforms can host the Django app directly from the repository:
1. Add `Procfile`: `web: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
2. Set environment variables in the platform dashboard
3. Add a managed PostgreSQL instance
4. Frontend can be deployed to Netlify/Vercel separately

### Vercel / Netlify (Frontend Only)

Deploy the React SPA:
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Add rewrite rule: `/* → /index.html`
- Set `VITE_API_BASE_URL` environment variable

## Database Backup

```bash
# Backup
pg_dump -U devforum_user devforum > backup_$(date +%Y%m%d).sql

# Restore
psql -U devforum_user devforum < backup_20261029.sql
```

## Known Limitations

- This deployment guide is aspirational — the application has been developed and tested locally only
- No Docker production setup is provided (only a dev Docker Compose for PostgreSQL)
- Media file storage should use S3 or similar object storage in production (currently local filesystem)
- Email sending is not configured — password reset flows would need SMTP setup
