import asyncio

from fastapi import APIRouter, HTTPException, Request

import lemmy_client as lc
import sessions
from transforms import extract_instance, format_count, relative_time, transform_post

router = APIRouter()


@router.get("")
async def get_my_profile(request: Request):
    sid, session = sessions.get_session(request)
    if not sid or not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    username = session.get("username")
    instance_url = session.get("instance", "")
    instance_display = instance_url.replace("https://", "").replace("http://", "")

    if not username:
        # Anonymous session
        return {"user": None, "posts": [], "comments": []}

    def fetch():
        return lc.get_or_create(sid, session).person.get(username=username)

    try:
        result = await asyncio.to_thread(fetch)
        if not result or not isinstance(result, dict):
            return _empty_profile(username, instance_display)

        pv = result.get("person_view", {})
        person = pv.get("person", {})
        counts = pv.get("counts", {})

        posts_raw = result.get("posts", [])
        comments_raw = result.get("comments", [])

        posts = [transform_post(p) for p in posts_raw[:20]]

        comments = [
            {
                "id": cv.get("comment", {}).get("id"),
                "body": cv.get("comment", {}).get("content", ""),
                "score": cv.get("counts", {}).get("score", 0),
                "age": relative_time(cv.get("comment", {}).get("published", "")),
                "community": cv.get("community", {}).get("name", ""),
                "post_title": cv.get("post", {}).get("name", ""),
            }
            for cv in comments_raw[:20]
        ]

        return {
            "user": {
                "name": person.get("name", username),
                "instance": extract_instance(person.get("actor_id", "")) or instance_display,
                "bio": person.get("bio") or "",
                "post_count": counts.get("post_count", 0),
                "comment_count": counts.get("comment_count", 0),
                "score": counts.get("post_score", 0) + counts.get("comment_score", 0),
                "avatar": None,
            },
            "posts": posts,
            "comments": comments,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{username}")
async def get_user_profile(username: str, request: Request):
    sid, session = sessions.get_session(request)

    def fetch():
        lemmy = lc.get_or_create(sid, session) if (sid and session) else lc.get_anon()
        return lemmy.person.get(username=username)

    try:
        result = await asyncio.to_thread(fetch)
        if not result or not isinstance(result, dict):
            raise HTTPException(status_code=404, detail="User not found")

        pv = result.get("person_view", {})
        person = pv.get("person", {})
        counts = pv.get("counts", {})

        return {
            "user": {
                "name": person.get("name", username),
                "instance": extract_instance(person.get("actor_id", "")),
                "bio": person.get("bio") or "",
                "post_count": counts.get("post_count", 0),
                "comment_count": counts.get("comment_count", 0),
                "score": counts.get("post_score", 0) + counts.get("comment_score", 0),
                "avatar": None,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def _empty_profile(username: str, instance: str) -> dict:
    return {
        "user": {"name": username, "instance": instance, "bio": "", "avatar": None,
                 "post_count": 0, "comment_count": 0, "score": 0},
        "posts": [],
        "comments": [],
    }
