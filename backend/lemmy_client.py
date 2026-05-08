from typing import Optional
from pythorhead import Lemmy

_clients: dict[str, Lemmy] = {}


def get_or_create(sid: str, session: dict) -> Lemmy:
    """Return a cached (and authenticated) Lemmy instance for this session."""
    if sid in _clients:
        return _clients[sid]

    instance = session.get("instance", "https://lemmy.world")
    lemmy = Lemmy(instance)

    jwt = session.get("jwt")
    if jwt:
        # Restore the stored JWT so requests are authenticated
        lemmy.key = jwt

    _clients[sid] = lemmy
    return lemmy


def store(sid: str, lemmy: Lemmy):
    _clients[sid] = lemmy


def invalidate(sid: str):
    _clients.pop(sid, None)


def get_anon(instance: str = "https://lemmy.world") -> Lemmy:
    """Return a fresh unauthenticated Lemmy client."""
    return Lemmy(instance)
