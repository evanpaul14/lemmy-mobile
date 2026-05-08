import asyncio

from fastapi import APIRouter, HTTPException, Request

import lemmy_client as lc
import sessions
from transforms import transform_mention, transform_message, transform_reply

router = APIRouter()


def _require_auth(sid, session):
    if not sid or not session or not session.get("jwt"):
        raise HTTPException(status_code=401, detail="Authentication required")


@router.get("/replies")
async def get_replies(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"replies": []}

    def fetch():
        client = lc.get_or_create(sid, session)
        result = client.get("/comment/replies", {"unread_only": False, "page": 1, "limit": 50})
        return result.get("replies", []) if isinstance(result, dict) else []

    try:
        items = await asyncio.to_thread(fetch)
        return {"replies": [transform_reply(r) for r in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/mentions")
async def get_mentions(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"mentions": []}

    def fetch():
        client = lc.get_or_create(sid, session)
        result = client.get("/person/mention", {"unread_only": False, "page": 1, "limit": 50})
        return result.get("mentions", []) if isinstance(result, dict) else []

    try:
        items = await asyncio.to_thread(fetch)
        return {"mentions": [transform_mention(m) for m in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/messages")
async def get_messages(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session or not session.get("jwt"):
        return {"messages": []}

    def fetch():
        client = lc.get_or_create(sid, session)
        result = client.get("/private_message/list", {"unread_only": False, "page": 1, "limit": 50})
        return result.get("private_messages", []) if isinstance(result, dict) else []

    try:
        items = await asyncio.to_thread(fetch)
        return {"messages": [transform_message(m) for m in items]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/replies/{reply_id}/read")
async def mark_reply_read(reply_id: int, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_mark():
        return lc.get_or_create(sid, session).post("/comment/mark_as_read", {
            "comment_reply_id": reply_id,
            "read": True,
        })

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
        return lc.get_or_create(sid, session).post("/person/mention/mark_as_read", {
            "person_mention_id": mention_id,
            "read": True,
        })

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
        return lc.get_or_create(sid, session).post("/private_message/mark_as_read", {
            "private_message_id": msg_id,
            "read": True,
        })

    try:
        await asyncio.to_thread(do_mark)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
