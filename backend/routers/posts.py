import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

import lemmy_client as lc
import sessions
from transforms import build_comment_tree, transform_post

router = APIRouter()


def _get_client(sid, session) -> lc.LemmyClient:
    if sid and session:
        return lc.get_or_create(sid, session)
    return lc.get_anon()


def _require_auth(sid, session):
    if not sid or not session or not session.get("jwt"):
        raise HTTPException(status_code=401, detail="Authentication required")


# ── Feed ──────────────────────────────────────────────────────────────────────

@router.get("")
async def get_posts(
    request: Request,
    type: str = Query("All"),
    sort: str = Query("Hot"),
    page: int = Query(1),
    community_name: Optional[str] = Query(None),
):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        if community_name:
            return client.get("/post/list", {"community_name": community_name, "sort": sort, "page": page, "limit": 20})
        return client.get("/post/list", {"type": type, "sort": sort, "page": page, "limit": 20})

    try:
        result = await asyncio.to_thread(fetch)
        posts = result.get("posts", []) if isinstance(result, dict) else []
        return {"posts": [transform_post(pv) for pv in posts]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Single post ───────────────────────────────────────────────────────────────

@router.get("/{post_id}/comments")
async def get_comments(
    post_id: int,
    request: Request,
    sort: str = Query("Hot"),
):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        result = client.get("/comment/list", {"post_id": post_id, "sort": sort, "max_depth": 6, "limit": 100})
        return result.get("comments", []) if isinstance(result, dict) else []

    try:
        cvs = await asyncio.to_thread(fetch)
        return {"comments": build_comment_tree(cvs)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{post_id}")
async def get_post(post_id: int, request: Request):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        return client.get("/post", {"id": post_id})

    try:
        result = await asyncio.to_thread(fetch)
        if not result:
            raise HTTPException(status_code=404, detail="Post not found")
        pv = result.get("post_view", {}) if isinstance(result, dict) else {}
        return {"post": transform_post(pv)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Votes & saves ─────────────────────────────────────────────────────────────

class VoteBody(BaseModel):
    score: int


@router.post("/{post_id}/vote")
async def vote_post(post_id: int, body: VoteBody, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_vote():
        return lc.get_or_create(sid, session).post("/post/like", {"post_id": post_id, "score": body.score})

    try:
        result = await asyncio.to_thread(do_vote)
        counts = result.get("post_view", {}).get("counts", {}) if isinstance(result, dict) else {}
        votes = "up" if body.score == 1 else "down" if body.score == -1 else None
        return {"success": True, "votes": votes, "score": counts.get("score", 0)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class SaveBody(BaseModel):
    save: bool


@router.post("/{post_id}/save")
async def save_post(post_id: int, body: SaveBody, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_save():
        return lc.get_or_create(sid, session).post("/post/save", {"post_id": post_id, "save": body.save})

    try:
        await asyncio.to_thread(do_save)
        return {"success": True, "saved": body.save}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Create ────────────────────────────────────────────────────────────────────

class CreatePostBody(BaseModel):
    community_id: int
    title: str
    body: Optional[str] = None
    url: Optional[str] = None
    nsfw: bool = False


@router.post("")
async def create_post(body: CreatePostBody, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_create():
        return lc.get_or_create(sid, session).post("/post", {
            "community_id": body.community_id,
            "name": body.title,
            "body": body.body,
            "url": body.url,
            "nsfw": body.nsfw,
        })

    try:
        result = await asyncio.to_thread(do_create)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create post")
        pv = result.get("post_view", {}) if isinstance(result, dict) else {}
        return {"post": transform_post(pv)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
