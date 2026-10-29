# DevForum — API Documentation

## Base URL

```
http://localhost:8000/api/v1/
```

Interactive API docs are available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Authentication

DevForum uses JWT Bearer token authentication.

Include the access token in all authenticated requests:
```
Authorization: Bearer <access_token>
```

### Obtain Tokens

**POST /auth/login/**

```json
// Request
{ "email": "user@example.com", "password": "mypassword" }

// Response 200
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "user": {
    "id": 1, "username": "alice_dev", "email": "user@example.com",
    "display_name": "Alice", "reputation": 42, ...
  }
}
```

**POST /auth/register/**

```json
// Request
{
  "email": "new@example.com",
  "username": "newuser",
  "password": "StrongPass123!",
  "password_confirm": "StrongPass123!",
  "display_name": "New User"  // optional
}
// Response 201 — same shape as login
```

**POST /auth/token/refresh/**

```json
// Request
{ "refresh": "<refresh_token>" }
// Response 200
{ "access": "<new_access>", "refresh": "<new_refresh>" }
```

**POST /auth/logout/**

```json
// Request (authenticated)
{ "refresh": "<refresh_token>" }
// Response 200  { "detail": "..." }
```

---

## Error Format

All errors return JSON in one of two formats:

```json
// Single message
{ "detail": "Authentication credentials were not provided." }

// Field validation errors
{
  "email": ["This field may not be blank."],
  "password": ["This password is too short."]
}
```

---

## Pagination

List endpoints return paginated responses:

```json
{
  "count": 147,
  "next": "http://localhost:8000/api/v1/questions/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

Default page size: 20. Use `?page=<n>` for pagination.

---

## Questions

### GET /questions/

Query parameters:
| Parameter | Description |
|-----------|-------------|
| `search` | Search in title, body, and tag names |
| `tag` | Filter by tag slug |
| `status` | Filter by status: `open`, `solved`, `closed` |
| `has_accepted_answer` | `true` or `false` |
| `unanswered` | `true` to show questions with no answers |
| `ordering` | `-created_at` (newest), `created_at`, `-vote_score`, `vote_score` |
| `page` | Page number |

**Response item:**
```json
{
  "id": 1,
  "title": "How do I use select_related in Django?",
  "author": {
    "id": 2, "username": "alice_dev", "display_name": "Alice",
    "avatar_url": null, "reputation": 42
  },
  "tags": [{"id": 1, "name": "django", "slug": "django"}],
  "status": "solved",
  "vote_score": 15,
  "answer_count": 3,
  "has_accepted_answer": true,
  "view_count": 124,
  "created_at": "2026-10-29T10:00:00Z",
  "updated_at": "2026-10-29T12:00:00Z"
}
```

### POST /questions/

Requires authentication.

```json
// Request
{
  "title": "How do I configure CORS in Django?",  // min 15 chars
  "body": "I'm getting CORS errors...",            // min 30 chars
  "tag_names": ["django", "cors", "rest-api"]      // optional, creates tags if new
}
// Response 201 — QuestionDetail shape
```

### GET /questions/:id/

Returns full question detail including answers and comments.

```json
{
  "id": 1,
  "title": "...",
  "body": "...",
  "author": { ... },
  "tags": [...],
  "status": "open",
  "vote_score": 5,
  "user_vote": 1,         // null if not authenticated or not voted
  "view_count": 42,
  "answer_count": 2,
  "has_accepted_answer": false,
  "answers": [ ... ],
  "comments": [ ... ],
  "created_at": "...",
  "updated_at": "..."
}
```

### PATCH /questions/:id/

Requires authentication. Author or admin only. Partial update supported.

```json
// Request (any fields optional)
{ "title": "Updated title", "body": "Updated body", "tag_names": ["python"] }
```

### DELETE /questions/:id/

Requires authentication. Author or admin only. Returns 204.

---

## Answers

### GET /questions/:id/answers/

Returns paginated list of answers for a question.

### POST /questions/:id/answers/

Requires authentication.

```json
// Request
{ "body": "Here is my detailed answer..." }  // min 30 chars
```

### PATCH /questions/answers/:id/

Requires authentication. Author only.

### DELETE /questions/answers/:id/

Requires authentication. Author only. Returns 204.

### POST /questions/:questionId/answers/:answerId/accept/

Requires authentication. Question author only.

```json
// Response 200
{ "detail": "Answer accepted.", "answer_id": 5 }
```

### POST /questions/:questionId/answers/:answerId/unaccept/

Requires authentication. Question author only.

```json
// Response 200
{ "detail": "Answer unaccepted." }
```

---

## Comments

### GET /questions/:id/comments/

Returns comments on a question.

### POST /questions/:id/comments/

Requires authentication.

```json
// Request
{ "body": "Can you clarify what you mean by..." }  // min 10 chars, max 600
```

### GET /questions/answers/:id/comments/

Returns comments on an answer.

### POST /questions/answers/:id/comments/

Requires authentication. Same body as question comments.

### PATCH /questions/comments/:id/

Requires authentication. Author only.

### DELETE /questions/comments/:id/

Requires authentication. Author only. Returns 204.

---

## Tags

### GET /tags/

Returns all tags ordered by question count.

```json
// Response item
{
  "id": 1, "name": "python", "slug": "python",
  "description": "Questions about Python...",
  "question_count": 42, "created_at": "2026-10-01T00:00:00Z"
}
```

### GET /tags/:slug/

Returns a single tag by slug.

---

## Votes

### POST /votes/questions/:id/

Requires authentication. Cannot vote on own content.

```json
// Request
{ "value": 1 }   // 1 = upvote, -1 = downvote

// Response 200
{ "vote_score": 16, "user_vote": 1 }
// If same vote is sent twice, it toggles off:
{ "vote_score": 15, "user_vote": null }
```

### POST /votes/answers/:id/

Same behavior as question voting.

---

## User Profiles

### GET /auth/users/

Returns paginated list of users.

### GET /auth/users/:username/

Returns public profile (no email).

```json
{
  "id": 1, "username": "alice_dev", "display_name": "Alice Chen",
  "bio": "Full-stack developer", "avatar_url": null,
  "website": "", "location": "", "date_joined": "2026-10-01T00:00:00Z",
  "reputation": 42, "question_count": 5, "answer_count": 12, "accepted_answer_count": 3
}
```

### GET /auth/me/

Requires authentication. Same as public profile + `email` field.

### PATCH /auth/me/

Requires authentication. Partial update. Supports multipart/form-data for avatar upload.

```
Fields: display_name, bio, website, location, avatar (file)
```

### POST /auth/me/change-password/

```json
{
  "old_password": "current",
  "new_password": "newstrong",
  "new_password_confirm": "newstrong"
}
```

---

## Notifications

### GET /notifications/

Requires authentication. Returns own notifications.

Query: `?unread=true` to filter unread only.

```json
// Response item
{
  "id": 1,
  "sender": { "id": 2, "username": "bob", "display_name": "Bob", "avatar_url": null, "reputation": 30 },
  "notification_type": "answer",
  "question_id": 5,
  "question_title": "How do I...?",
  "answer": 12,
  "is_read": false,
  "created_at": "2026-10-29T10:00:00Z"
}
```

### GET /notifications/count/

```json
{ "unread_count": 3 }
```

### POST /notifications/mark-all-read/

Marks all of the authenticated user's notifications as read.

### POST /notifications/:id/read/

Marks a single notification as read.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
