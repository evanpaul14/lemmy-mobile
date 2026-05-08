import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

import lemmy_client as lc
import sessions

router = APIRouter()


def _require_auth(sid, session):
    if not sid or not session or not session.get("jwt"):
        raise HTTPException(status_code=401, detail="Authentication required")


class VoteBody(BaseModel):
    score: int  # 1, 0, -1


@router.post("/{comment_id}/vote")
async def vote_comment(comment_id: int, body: VoteBody, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_vote():
        return lc.get_or_create(sid, session).comment.like(comment_id=comment_id, score=body.score)

    try:
        await asyncio.to_thread(do_vote)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class CreateCommentBody(BaseModel):
    post_id: int
    content: str
    parent_id: Optional[int] = None


@router.post("")
async def create_comment(body: CreateCommentBody, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_create():
        return lc.get_or_create(sid, session).comment.create(
            post_id=body.post_id,
            content=body.content,
            parent_id=body.parent_id,
        )

    try:
        await asyncio.to_thread(do_create)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/{comment_id}/mark-read")
async def mark_comment_read(comment_id: int, request: Request):
    sid, session = sessions.get_session(request)
    _require_auth(sid, session)

    def do_mark():
        return lc.get_or_create(sid, session).comment.mark_as_read(
            comment_reply_id=comment_id, read=True
        )

    try:
        await asyncio.to_thread(do_mark)
        return {"success": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
