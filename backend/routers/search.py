import asyncio

from fastapi import APIRouter, HTTPException, Query, Request

import lemmy_client as lc
import sessions
from transforms import transform_community, transform_post, transform_user

router = APIRouter()


@router.get("")
async def search(
    request: Request,
    q: str = Query(..., min_length=1),
    type: str = Query("All"),
    sort: str = Query("TopAll"),
    page: int = Query(1),
):
    sid, session = sessions.get_session(request)

    def do_search():
        lemmy = lc.get_or_create(sid, session) if (sid and session) else lc.get_anon()
        return lemmy.search(q=q, type_=type, sort=sort, page=page, limit=20)

    try:
        result = await asyncio.to_thread(do_search)
        if not isinstance(result, dict):
            result = {}

        return {
            "posts": [transform_post(pv) for pv in result.get("posts", [])],
            "communities": [transform_community(cv) for cv in result.get("communities", [])],
            "users": [transform_user(uv) for uv in result.get("users", [])],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
