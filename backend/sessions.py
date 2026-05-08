import secrets
import time
from typing import Optional

from fastapi import Request
from itsdangerous import URLSafeSerializer, BadSignature

_SECRET = secrets.token_hex(32)
_signer = URLSafeSerializer(_SECRET)
_store: dict[str, dict] = {}

COOKIE_NAME = "lemmy_sid"


def new_session(data: dict) -> tuple[str, str]:
    """Create a session. Returns (sid, signed_token)."""
    sid = secrets.token_urlsafe(24)
    _store[sid] = {"created_at": time.time(), **data}
    token = _signer.dumps(sid)
    return sid, token


def get_session(request: Request) -> tuple[Optional[str], Optional[dict]]:
    """Returns (sid, session_data) or (None, None)."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None, None
    try:
        sid = _signer.loads(token)
        data = _store.get(sid)
        return sid, data
    except BadSignature:
        return None, None


def update_session(sid: str, data: dict):
    if sid in _store:
        _store[sid].update(data)


def delete_session(sid: str):
    _store.pop(sid, None)
