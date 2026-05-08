import asyncio

from fastapi import APIRouter, HTTPException, Request

import lemmy_client as lc
import sessions
from transforms import transform_mention, transform_message, transform_reply

router = APIRouter()


def _require_auth(sid, session):
    if not sid or not session or not session.get("jwt"):
        raise HTTPException(status_code=401, detail="Authentication required")


def _normalize(result, key: str) -> list:
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get(key, [])
    return []


# ── Replies ───────────────────────────────────────────────────────────────────

@router.get("/replies")
async def get_replies(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"replies": []}

    def fetch():
        lemmy = lc.get_or_create(sid, session)
        # pythorhead exposes this as comment.get_replies or comment.replies
        try:
            result = lemmy.comment.get_replies(unread_only=False, page=1, limit=50)
        except AttributeError:
            result = lemmy.comment.replies(unread_only=False, page=1, limit=50)
        return _normalize(result, "replies")

    try:
        items = await asyncio.to_thread(fetch)
        return {"replies": [transform_reply(r) for r in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Mentions ──────────────────────────────────────────────────────────────────

@router.get("/mentions")
async def get_mentions(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"mentions": []}

    def fetch():
        lemmy = lc.get_or_create(sid, session)
        try:
            result = lemmy.person.get_mentions(unread_only=False, page=1, limit=50)
        except AttributeError:
            result = lemmy.person.mentions(unread_only=False, page=1, limit=50)
        return _normalize(result, "mentions")

    try:
        items = await asyncio.to_thread(fetch)
        return {"mentions": [transform_mention(m) for m in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Messages ──────────────────────────────────────────────────────────────────

@router.get("/messages")
async def get_messages(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"messages": []}

    def fetch():
        lemmy = lc.get_or_create(sid, session)
        result = lemmy.private_message.list(unread_only=False, page=1, limit=50)
        return _normalize(result, "private_messages")

    try:
        items = await asyncio.to_thread(fetch)
        return {"messages": [transform_message(m) for m in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Mark read ─────────────────────────────────────────────────────────────────

@router.post("/replies/{reply_id}/read")
async def mark_reply_read(reply_id: int, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_mark():
        return lc.get_or_create(sid, session).comment.mark_as_read(
            comment_reply_id=reply_id, read=True
        )

    try:
        await asyncio.to_thread(do_mark)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/mentions/{mention_id}/read")
async def mark_mention_read(mention_id: int, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_mark():
        return lc.get_or_create(sid, session).person.mark_mention_as_read(
            person_mention_id=mention_id, read=True
        )

    try:
        await asyncio.to_thread(do_mark)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/messages/{msg_id}/read")
async def mark_message_read(msg_id: int, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_mark():
        return lc.get_or_create(sid, session).private_message.mark_as_read(
            private_message_id=msg_id, read=True
        )

    try:
        await asyncio.to_thread(do_mark)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
