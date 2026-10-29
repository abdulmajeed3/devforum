# DevForum — Security Documentation

## Authentication

DevForum uses **JWT (JSON Web Tokens)** via `djangorestframework-simplejwt`.

### Token Lifecycle

| Token | Lifetime | Storage |
|-------|----------|---------|
| Access | 60 minutes (configurable) | `localStorage` on the client |
| Refresh | 7 days (configurable) | `localStorage` on the client |

**Token rotation:** On each token refresh, both the access and refresh tokens are rotated. The old refresh token is blacklisted via `rest_framework_simplejwt.token_blacklist`.

**Logout:** The refresh token is blacklisted on the backend on logout. The access token remains valid until it expires (no server-side revocation for access tokens — this is a known tradeoff of stateless JWTs).

### Authentication Flow

1. User logs in with email + password → receives `access` + `refresh` tokens
2. All authenticated requests include `Authorization: Bearer <access>` header
3. When the access token expires (401 response), the frontend automatically calls `/auth/token/refresh/`
4. If refresh fails, the user is logged out and redirected to `/login`

### Password Security

- Django's `AbstractBaseUser` uses PBKDF2-SHA256 with a per-user salt
- Password validation: minimum length, common password check, similarity to username/email
- Passwords are never returned in API responses
- Password change requires the current password

## Authorization

### Permission Model

| Resource | Unauthenticated | Authenticated (own) | Authenticated (other) | Admin |
|----------|-----------------|---------------------|-----------------------|-------|
| Questions (read) | ✓ | ✓ | ✓ | ✓ |
| Questions (create) | ✗ | ✓ | ✓ | ✓ |
| Questions (edit) | ✗ | ✓ | ✗ | ✓ |
| Questions (delete) | ✗ | ✓ | ✗ | ✓ |
| Answers (read) | ✓ | ✓ | ✓ | ✓ |
| Answers (create) | ✗ | ✓ | ✓ | ✓ |
| Answers (edit) | ✗ | ✓ | ✗ | ✓ |
| Answers (delete) | ✗ | ✓ | ✗ | ✓ |
| Answer (accept) | ✗ | Question author only | ✗ | ✓ |
| Comments (create) | ✗ | ✓ | ✓ | ✓ |
| Comments (delete) | ✗ | ✓ | ✗ | ✓ |
| Votes | ✗ | ✓ (not own content) | ✓ | ✓ |
| Profile (read) | ✓ | ✓ | ✓ | ✓ |
| Profile (edit) | ✗ | Own only | ✗ | ✓ |
| Notifications | ✗ | Own only | ✗ | ✓ |

**Server-side enforcement:** All permission checks happen in the backend. Frontend hiding of buttons is a UX convenience only, not a security boundary.

### Custom Permission Classes

- `IsAuthorOrReadOnly` — Allows read for everyone; write only for the resource author
- `IsQuestionAuthor` — Allows action only for the question's author (used for accept/unaccept)

## Input Validation

- All inputs are validated via DRF serializers before processing
- Title: min 15 characters, max 300
- Question body: min 30 characters
- Answer body: min 30 characters
- Comment body: min 10 characters, max 600
- Username: letters, numbers, hyphens, underscores only; stored lowercase
- Avatar: max 2MB, allowed extensions: jpg, jpeg, png, gif, webp

## Markdown Safety

User-supplied markdown is rendered on the frontend using `react-markdown` with `remark-gfm`. This library:
- Does not use `dangerouslySetInnerHTML` by default
- Sanitizes `href` values (no `javascript:` URIs)
- Does not execute arbitrary scripts

The body content is stored as raw Markdown text in the database and rendered client-side.

**NOT implemented:** Server-side HTML sanitization — this is acceptable because markdown is rendered client-side and `react-markdown` does not output raw HTML by default.

## CORS

CORS is configured via `django-cors-headers`:
- `CORS_ALLOWED_ORIGINS` — configured via environment variable, defaults to localhost:5173
- `CORS_ALLOW_CREDENTIALS = True`
- No wildcard (`*`) origins in production

## Rate Limiting

DRF throttling is configured:
- Anonymous: 100 requests/hour
- Authenticated users: 1000 requests/hour

## Avatar Uploads

- File extension validation (allowlist)
- File size limit (2MB)
- Files saved to `MEDIA_ROOT/avatars/` with sanitized filenames
- No executable code can be served as media (Django's file server in dev; configure web server in production)

## Database Security

- Database constraints enforce vote uniqueness and comment target exclusivity
- Vote score updates use atomic `update()` queries
- Answer acceptance uses `select_for_update()` to prevent race conditions

## Environment Variables

- All secrets are loaded via `python-decouple` from `.env` files
- `.env` is excluded from version control via `.gitignore`
- `.env.example` documents required variables without values

## Production Considerations

The following settings should be configured for production (see `docs/DEPLOYMENT.md`):

- `DEBUG = False`
- `SECRET_KEY` — long random value
- `ALLOWED_HOSTS` — specific domain names
- `SECURE_SSL_REDIRECT = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`
- Database over SSL
- Static files via CDN or web server (not Django)
- Media files via object storage (S3, etc.)

## Known Limitations

1. **Access token revocation**: Access tokens cannot be invalidated before they expire (JWT statelessness tradeoff). For high-security scenarios, shorten `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`.
2. **localStorage storage**: Tokens stored in `localStorage` are accessible to JavaScript, making them susceptible to XSS. An HttpOnly cookie approach would be more XSS-resistant, but requires CSRF protection.
3. **No email verification**: Registration does not verify email addresses. Add email confirmation for production use.
4. **No 2FA**: Two-factor authentication is not implemented.
5. **Rate limiting is global**: Not per-IP or per-endpoint. Production deployments should add more granular rate limiting at the reverse proxy level.
6. **This project has not been penetration tested.**
