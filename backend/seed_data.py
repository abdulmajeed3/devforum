"""
Development seed data for DevForum.
Run with: python manage.py shell -c "from seed_data import seed; seed()"
"""
import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from apps.questions.models import Answer, Question  # noqa: E402
from apps.tags.models import Tag  # noqa: E402

User = get_user_model()


def seed():
    print("Seeding database...")

    users = []
    user_data = [
        {"email": "alice@example.com", "username": "alice_dev", "display_name": "Alice Chen",
         "bio": "Full-stack developer, Python & React enthusiast."},
        {"email": "bob@example.com", "username": "bob_coder", "display_name": "Bob Martinez",
         "bio": "Backend engineer specializing in distributed systems."},
        {"email": "carol@example.com", "username": "carol_writes", "display_name": "Carol Kim",
         "bio": "Software engineer and technical blogger."},
        {"email": "dave@example.com", "username": "dave_builds", "display_name": "Dave Singh",
         "bio": "DevOps and cloud infrastructure specialist."},
    ]
    for data in user_data:
        user, created = User.objects.get_or_create(email=data["email"], defaults={**data})
        if created:
            user.set_password("DevForum123!")
            user.save()
        users.append(user)

    admin_user, created = User.objects.get_or_create(
        email="admin@devforum.dev",
        defaults={"username": "admin", "display_name": "DevForum Admin", "is_staff": True, "is_superuser": True}
    )
    if created:
        admin_user.set_password("Admin123!")
        admin_user.save()

    tag_data = [
        ("python", "Questions about the Python programming language"),
        ("javascript", "Questions about JavaScript, the web scripting language"),
        ("react", "Questions about the React JavaScript library"),
        ("django", "Questions about the Django Python web framework"),
        ("typescript", "Questions about TypeScript, a typed superset of JavaScript"),
        ("postgresql", "Questions about PostgreSQL database"),
        ("docker", "Questions about Docker containers"),
        ("rest-api", "Questions about RESTful API design and implementation"),
        ("git", "Questions about version control with Git"),
        ("css", "Questions about Cascading Style Sheets"),
    ]
    tags = {}
    for name, desc in tag_data:
        tag, _ = Tag.objects.get_or_create(name=name, defaults={"description": desc})
        tags[name] = tag

    questions_data = [
        {
            "author": users[0],
            "title": "How do I efficiently query related objects in Django without N+1 problems?",
            "body": (
                "I'm building a Django application and running into performance issues with my queries.\n\n"
                "When I list questions with their authors and tags, I notice the Django ORM is making a "
                "separate database query for each question's related data. I've heard this is called the N+1 problem.\n\n"
                "Here's my current code:\n\n"
                "```python\n"
                "questions = Question.objects.all()\n"
                "for q in questions:\n"
                "    print(q.author.username)  # This hits the DB for each question!\n"
                "    print([t.name for t in q.tags.all()])  # Another DB hit!\n"
                "```\n\n"
                "What's the proper way to use `select_related` and `prefetch_related` to solve this?"
            ),
            "tags": ["python", "django", "postgresql"],
            "vote_score": 15,
        },
        {
            "author": users[1],
            "title": "What is the difference between useEffect and useLayoutEffect in React?",
            "body": (
                "I'm building a React application and I keep seeing references to both `useEffect` "
                "and `useLayoutEffect`.\n\n"
                "Can someone explain:\n"
                "1. The key differences between them\n"
                "2. When would I actually want to use `useLayoutEffect` instead of `useEffect`?\n"
                "3. Any performance considerations I should know about?\n\n"
                "```typescript\n"
                "useLayoutEffect(() => {\n"
                "  // Do something\n"
                "}, [dependency]);\n\n"
                "// vs this?\n"
                "useEffect(() => {\n"
                "  // Do something\n"
                "}, [dependency]);\n"
                "```"
            ),
            "tags": ["react", "javascript", "typescript"],
            "vote_score": 22,
        },
        {
            "author": users[2],
            "title": "How do I configure CORS in Django REST Framework for a React frontend?",
            "body": (
                "I'm building a Django REST Framework API and a separate React frontend. "
                "When my React app tries to call the API, I get a CORS error:\n\n"
                "```\nAccess to XMLHttpRequest at 'http://localhost:8000/api/v1/questions/' "
                "from origin 'http://localhost:5173' has been blocked by CORS policy\n```\n\n"
                "I've installed `django-cors-headers` but I'm not sure how to configure it correctly. "
                "What do I need to add to make this work in development, and what's the right way to "
                "configure it for production?"
            ),
            "tags": ["django", "rest-api", "react"],
            "vote_score": 18,
        },
        {
            "author": users[3],
            "title": "What's the best way to handle JWT token refresh in React with TanStack Query?",
            "body": (
                "I'm using JWT authentication in my React app with TanStack Query for data fetching. "
                "My access tokens expire after 60 minutes, and I need to automatically refresh them.\n\n"
                "Currently I store the tokens in localStorage and add them to each request via an Axios "
                "interceptor. But I'm not sure how to handle the case where a request fails because the "
                "token expired.\n\n"
                "```typescript\n"
                "axios.interceptors.response.use(\n"
                "  (response) => response,\n"
                "  async (error) => {\n"
                "    if (error.response?.status === 401) {\n"
                "      // How do I refresh the token here?\n"
                "    }\n"
                "    return Promise.reject(error);\n"
                "  }\n"
                ");\n"
                "```\n\n"
                "Is there a clean way to implement this with TanStack Query?"
            ),
            "tags": ["react", "typescript", "rest-api"],
            "vote_score": 12,
        },
    ]

    questions = []
    for qd in questions_data:
        q, created = Question.objects.get_or_create(
            title=qd["title"],
            defaults={
                "author": qd["author"],
                "body": qd["body"],
                "vote_score": qd["vote_score"],
            }
        )
        if created:
            q.tags.set([tags[t] for t in qd["tags"] if t in tags])
        questions.append(q)

    answers_data = [
        {
            "question": questions[0],
            "author": users[1],
            "body": (
                "The solution is to use `select_related` for ForeignKey/OneToOne relationships and "
                "`prefetch_related` for ManyToMany and reverse ForeignKey relationships.\n\n"
                "```python\n"
                "questions = Question.objects.select_related('author').prefetch_related('tags')\n\n"
                "for q in questions:\n"
                "    print(q.author.username)  # No extra DB query!\n"
                "    print([t.name for t in q.tags.all()])  # No extra DB query!\n"
                "```\n\n"
                "**When to use each:**\n\n"
                "- **`select_related`**: Use for ForeignKey and OneToOneField. Does a SQL JOIN.\n"
                "- **`prefetch_related`**: Use for ManyToManyField and reverse ForeignKey. Does a separate query."
            ),
            "is_accepted": True,
            "vote_score": 18,
        },
        {
            "question": questions[1],
            "author": users[0],
            "body": (
                "The key difference is **when** they run relative to browser painting:\n\n"
                "- **`useEffect`**: Runs *after* the browser has painted. Async, non-blocking.\n"
                "- **`useLayoutEffect`**: Runs *before* the browser paints. Synchronous, blocking.\n\n"
                "**The rule of thumb**: Start with `useEffect`. Only switch to `useLayoutEffect` if you "
                "notice a visual flicker because you're reading/writing to the DOM synchronously."
            ),
            "is_accepted": True,
            "vote_score": 25,
        },
    ]

    for ad in answers_data:
        answer, created = Answer.objects.get_or_create(
            question=ad["question"],
            author=ad["author"],
            defaults={
                "body": ad["body"],
                "is_accepted": ad["is_accepted"],
                "vote_score": ad["vote_score"],
            }
        )
        if ad["is_accepted"] and created:
            ad["question"].status = "solved"
            ad["question"].save(update_fields=["status"])

    print("Seed data created successfully!")
    print("Test users (password: DevForum123!):")
    for u in users:
        print(f"  - {u.email} / {u.username}")
    print("Admin: admin@devforum.dev / Admin123!")


if __name__ == "__main__":
    seed()
