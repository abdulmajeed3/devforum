# DevForum — Testing

## Overview

DevForum has two test suites: a Django backend suite using pytest and pytest-django, and a React frontend suite using Vitest and React Testing Library.

## Backend Tests

### Setup

```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Unix/macOS

# Tests require a running PostgreSQL instance
# Configure database via .env or environment variables
```

### Running Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run tests for a specific app
python -m pytest apps/accounts/
python -m pytest apps/questions/
python -m pytest apps/votes/

# Run a specific test file
python -m pytest apps/accounts/tests.py

# Run a specific test class
python -m pytest apps/questions/tests.py::TestAnswers

# Run a specific test
python -m pytest apps/questions/tests.py::TestAnswers::test_only_one_accepted_answer
```

### Configuration

`pytest.ini`:
```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### Coverage

Backend tests cover:

| Module | Coverage Areas |
|--------|---------------|
| accounts | Registration (success, duplicate email, password mismatch), login (success, wrong password), current user (requires auth, returns correct user), public profile (no email exposed) |
| questions | List (anonymous access), create (requires auth, authenticated success), edit (own question, cannot edit other's), accept answer (author only, wrong question rejected, only one accepted per question) |
| votes | Upvote question, duplicate vote toggling, vote change, cannot vote own content, requires authentication |

### Test Isolation

- Each test function marked with `@pytest.mark.django_db` runs in a transaction that is rolled back after the test
- Fixtures use unique user data to avoid conflicts
- No test data is shared across test classes

### Known Limitations

- Backend tests require a live PostgreSQL connection. SQLite cannot be used because the project uses PostgreSQL-specific partial unique indexes and check constraints.
- The test database is the same database configured in `.env` — use a dedicated test database URL for CI
- No factory_boy usage yet in the test suite (factory_boy is installed, available for expansion)

---

## Frontend Tests

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (development)
npm run test:watch
```

### Configuration

Vitest configuration is in `vite.config.ts`:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
}
```

`src/test/setup.ts` imports `@testing-library/jest-dom` for custom matchers like `toBeInTheDocument`.

### Test Coverage

| Component/Page | Test Scenarios |
|---------------|----------------|
| LoginPage | Form validation (empty fields, email format), submit button state, error display |
| QuestionCard | Renders title (as link), tags, vote score, answer count |
| VoteControls | Renders upvote/downvote buttons, shows score, disabled when not authenticated |

### Approach

Frontend tests use React Testing Library's philosophy: test behavior visible to users, not implementation details.

Example pattern:
```typescript
test('shows validation error for invalid email', async () => {
  const user = userEvent.setup()
  render(<LoginPage />)
  await user.type(screen.getByLabelText(/email/i), 'notanemail')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
```

API calls are mocked using `vi.mock`:
```typescript
vi.mock('@/lib/api-helpers', () => ({
  authApi: { login: vi.fn() }
}))
```

### Known Limitations

- No Playwright end-to-end tests are included in this release. The E2E setup requires a running backend + database, which is difficult to automate in CI without Docker.
- Frontend test coverage is limited to core components. Full coverage of all 15 pages would require more test files.
- TanStack Query's `QueryClientProvider` must be wrapped around components that use `useQuery`/`useMutation` in tests — helper wrappers should be created for this.

---

## End-to-End Test Plan (not yet implemented)

The following workflows are specified for future Playwright implementation:

1. **Registration + Question**: User registers → publishes a question → question appears in feed
2. **Answer + Accept**: Second user answers → question author accepts → status changes to Solved
3. **Authorization**: User cannot edit another user's question (edit button hidden, 403 on direct API call)
4. **Vote integrity**: User cannot vote twice to inflate score (duplicate vote toggles, score stays correct)
5. **Search**: User searches for keyword → relevant questions appear

To implement: add `playwright.config.ts` and `tests/e2e/` directory. Run with `npx playwright test`.
