# Changelog

All notable changes to DevForum are documented here.

## [Unreleased] — 2026-10-29

### Added

**Backend**
- Custom Django user model with email authentication, username, bio, avatar, and computed reputation
- JWT authentication via `djangorestframework-simplejwt` with token rotation and blacklisting
- Questions: create, list (paginated, filtered, searched), detail, update, delete
- Answers: create, list, update, delete, accept, unaccept (with transaction safety)
- Comments on questions and answers
- Vote system with toggle/change behavior, duplicate prevention, and atomic score updates
- Tag system with slug normalization and question count
- In-app notifications (answer received, comment, accepted) with read/unread state
- OpenAPI documentation via `drf-spectacular` at `/api/docs/`
- Django admin for all models
- Development seed data (4 users, 10 tags, 4 questions, 2 answers)
- pytest test suite covering auth, question CRUD, answer acceptance rules, voting
- Ruff linting and mypy type checking configuration

**Frontend**
- React 19 + TypeScript SPA with Vite
- JWT auth context with auto-refresh interceptor
- TanStack Query for server state management
- 15 pages: home, questions feed, question detail, ask, edit question, tags, tag questions, profile, edit profile, notifications, login, register, not found
- Reusable UI component library (Button, Input, Textarea, Badge, Avatar, Pagination, etc.)
- Markdown rendering with syntax highlighting (react-markdown + rehype-highlight)
- Vote controls with real-time score updates
- Tag input with chip creation
- Answer editor with Markdown support
- Responsive layout with mobile navigation

**Infrastructure**
- GitHub Actions CI (backend tests, linting; frontend type-check, tests, build)
- Docker Compose for PostgreSQL development service
- `.env.example` with all required variables documented

**Documentation**
- `README.md` with full setup, architecture, and usage instructions
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md` with ER diagram
- `docs/API.md` with all endpoints documented
- `docs/SECURITY.md` with permission matrix
- `docs/TESTING.md`
- `docs/DEPLOYMENT.md`
- `docs/TROUBLESHOOTING.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
