from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from routers import auth, posts, comments, communities, search, inbox, profile

PROJECT_DIR = Path(__file__).parent.parent / "project"

app = FastAPI(title="Lemmy Mobile API", docs_url="/api/docs", redoc_url=None)

# ── API routers (registered before static mount so they take priority) ───────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
app.include_router(communities.router, prefix="/api/communities", tags=["communities"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(inbox.router, prefix="/api/inbox", tags=["inbox"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])


# ── Frontend serving ─────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def index():
    return (PROJECT_DIR / "Lemmy.html").read_text()


# Serve all other project files (JSX, assets). Routes defined above take priority.
app.mount("/", StaticFiles(directory=str(PROJECT_DIR)), name="static")
