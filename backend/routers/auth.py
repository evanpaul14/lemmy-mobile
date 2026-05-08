import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from pythorhead import Lemmy

import lemmy_client as lc
import sessions

router = APIRouter()


def _normalize_instance(raw: str) -> str:
    raw = raw.strip().rstrip("/")
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"
    return raw


def _display_instance(url: str) -> str:
    return url.replace("https://", "").replace("http://", "")


class LoginRequest(BaseModel):
    instance: str
    username: str = ""
    password: str = ""
    anonymous: bool = False


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    instance_url = _normalize_instance(body.instance)

    if body.anonymous:
        sid, token = sessions.new_session({"instance": instance_url, "jwt": None, "username": None})
        response.set_cookie(sessions.COOKIE_NAME, token, httponly=True, samesite="lax", max_age=86400 * 30)
        return {"success": True, "user": None}

    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="Username and password required")

    def do_login():
        lemmy = Lemmy(instance_url)
        result = lemmy.log_in(body.username, body.password)
        jwt = getattr(lemmy, "key", None)
        return lemmy, jwt

    try:
        lemmy, jwt = await asyncio.to_thread(do_login)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Login failed: {exc}") from exc

    if not jwt:
        raise HTTPException(status_code=401, detail="Login failed: no token returned")

    sid, token = sessions.new_session(
        {"instance": instance_url, "jwt": jwt, "username": body.username}
    )
    lc.store(sid, lemmy)

    response.set_cookie(sessions.COOKIE_NAME, token, httponly=True, samesite="lax", max_age=86400 * 30)
    return {
        "success": True,
        "user": {
            "name": body.username,
            "instance": _display_instance(instance_url),
            "avatar": None,
        },
    }


@router.post("/logout")
async def logout(request: Request, response: Response):
    sid, _ = sessions.get_session(request)
    if sid:
        sessions.delete_session(sid)
        lc.invalidate(sid)
    response.delete_cookie(sessions.COOKIE_NAME)
    return {"success": True}


@router.get("/me")
async def me(request: Request):
    sid, session = sessions.get_session(request)
    if not session:
        return {"authenticated": False, "user": None}

    username = session.get("username")
    instance = _display_instance(session.get("instance", ""))
    return {
        "authenticated": True,
        "user": {"name": username, "instance": instance, "avatar": None} if username else None,
    }
