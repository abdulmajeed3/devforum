# DevForum — Troubleshooting Guide

## PostgreSQL Setup (No Docker)

If Docker is not available, install PostgreSQL manually:

### Windows

1. Download PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer and note the superuser password
3. Open pgAdmin or the psql command line
4. Create the database and user:

```sql
CREATE USER devforum_user WITH PASSWORD 'devforum_password';
CREATE DATABASE devforum OWNER devforum_user;
GRANT ALL PRIVILEGES ON DATABASE devforum TO devforum_user;
```

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s devforum_user
createdb devforum -O devforum_user
psql -c "ALTER USER devforum_user WITH PASSWORD 'devforum_password';"
```

### Ubuntu/Debian

```bash
sudo apt update && sudo apt install -y postgresql-16
sudo -u postgres psql -c "CREATE USER devforum_user WITH PASSWORD 'devforum_password';"
sudo -u postgres psql -c "CREATE DATABASE devforum OWNER devforum_user;"
```

---

## Common Installation Issues

### `psycopg2-binary` install fails

Install system dependencies first:
```bash
# Ubuntu/Debian
sudo apt install libpq-dev python3-dev

# macOS
brew install libpq
```

### `python manage.py migrate` fails with `role "devforum_user" does not exist`

The database user hasn't been created. Follow the PostgreSQL setup steps above.

### `pip install` fails with `error: Microsoft Visual C++ 14.0 is required`

Install "Build Tools for Visual Studio" from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

---

## Backend Errors

### `ImproperlyConfigured: AUTH_USER_MODEL refers to model 'accounts.User' that has not been installed`

Make sure `apps.accounts` is in `INSTALLED_APPS` in `config/settings.py`.

### `django.db.utils.OperationalError: FATAL: password authentication failed`

Check `.env` values `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` match your PostgreSQL setup.

### `ModuleNotFoundError: No module named 'config'`

Run `manage.py` from the `backend/` directory, not the project root:
```bash
cd backend
python manage.py runserver
```

### Migrations show `unapplied migrations`

```bash
cd backend
python manage.py showmigrations  # see what's pending
python manage.py migrate         # apply all
```

### `ruff check` fails with import sort errors

```bash
cd backend
python -m ruff check apps/ config/ --select I --fix
```

---

## Authentication Issues

### `401 Unauthorized` on all requests

The JWT access token has expired. The frontend should automatically refresh it. If it's not refreshing:
1. Check that `SIMPLE_JWT['ROTATE_REFRESH_TOKENS'] = True` is set
2. Check that `SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'] = True` is set and `rest_framework_simplejwt.token_blacklist` is in `INSTALLED_APPS`
3. Run `python manage.py migrate` — the blacklist app needs its own migration

### `403 Forbidden` when trying to edit content

The authenticated user is not the author of the resource. Check that you're logged in as the correct user.

### Tokens not persisting after page reload

Check that `localStorage.setItem('access_token', ...)` is being called after login. In some environments, `localStorage` may be blocked (private browsing).

---

## CORS Issues

### `CORS policy: No 'Access-Control-Allow-Origin' header`

Ensure `corsheaders.middleware.CorsMiddleware` is in `MIDDLEWARE` **before** `CommonMiddleware`:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # must be here
    'django.contrib.sessions.middleware.SessionMiddleware',
    ...
]
```

And check `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

### CORS works in dev but not production

Set `CORS_ALLOWED_ORIGINS` to your production frontend URL in the production `.env` file.

---

## Frontend Issues

### Vite proxy not working (`/api` requests fail)

The proxy is configured in `vite.config.ts` under `server.proxy`. Verify the backend is running on port 8000.

### `npm install` peer dependency conflicts

Run:
```bash
npm install --legacy-peer-deps
```

### TypeScript errors after adding packages

Run:
```bash
npm run type-check
```

If types are missing, install them:
```bash
npm install -D @types/package-name
```

### `tailwindcss` classes not applying

Ensure `@import "tailwindcss"` is in `src/index.css` and the file is imported in `main.tsx`. Tailwind v4 no longer requires `tailwind.config.js` for basic usage.

---

## Database Migration Issues

### `Migration fails with "column already exists"`

This can happen if migrations got out of sync. Try:
```bash
python manage.py showmigrations
python manage.py migrate --fake-initial
```

### `Cannot use bare slug` (PostgreSQL partial index error)

Run all migrations fresh on a clean database. Partial unique indexes require a clean migration run.

---

## Test Failures

### `django.db.utils.OperationalError: no such table`

Backend tests need a real PostgreSQL database with migrations applied. Set `DJANGO_SETTINGS_MODULE=config.settings` and ensure the database is running.

### Frontend tests failing with `ReferenceError: document is not defined`

Make sure `environment: 'jsdom'` is in the vitest config in `vite.config.ts`.

### `Cannot find module '@/...'`

Ensure TypeScript path aliases are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```
And the same alias is in `vite.config.ts`:
```typescript
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```
