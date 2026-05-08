import asyncio

from fastapi import APIRouter, HTTPException, Query, Request

import lemmy_client as lc
import sessions
from transforms import transform_community, transform_post

router = APIRouter()


def _get_client(sid, session) -> lc.LemmyClient:
    if sid and session:
        return lc.get_or_create(sid, session)
    return lc.get_anon()


@router.get("")
async def list_communities(
    request: Request,
    type: str = Query("All"),
    sort: str = Query("Active"),
    page: int = Query(1),
):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        return client.get("/community/list", {"type": type, "sort": sort, "page": page, "limit": 30})

    try:
        result = await asyncio.to_thread(fetch)
        cvs = result.get("communities", []) if isinstance(result, dict) else []
        return {"communities": [transform_community(cv) for cv in cvs]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{name}/posts")
async def get_community_posts(
    name: str,
    request: Request,
    sort: str = Query("Hot"),
    page: int = Query(1),
):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        return client.get("/post/list", {"community_name": name, "sort": sort, "page": page, "limit": 20})

    try:
        result = await asyncio.to_thread(fetch)
        pvs = result.get("posts", []) if isinstance(result, dict) else []
        return {"posts": [transform_post(pv) for pv in pvs]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{name}")
async def get_community(name: str, request: Request):
    sid, session = sessions.get_session(request)

    def fetch():
        client = _get_client(sid, session)
        return client.get("/community", {"name": name})

    try:
        result = await asyncio.to_thread(fetch)
        if not result:
            raise HTTPException(status_code=404, detail="Community not found")
        cv = result.get("community_view", {}) if isinstance(result, dict) else {}
        return {"community": transform_community(cv)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
