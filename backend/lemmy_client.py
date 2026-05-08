import httpx
from typing import Optional

_TIMEOUT = 15.0
_clients: dict[str, "LemmyClient"] = {}


class LemmyClient:
    def __init__(self, instance: str, jwt: Optional[str] = None):
        self.instance = instance.rstrip("/")
        self.base = self.instance + "/api/v3"
        self.jwt = jwt

    def _headers(self) -> dict:
        if self.jwt:
            return {"Authorization": f"Bearer {self.jwt}"}
        return {}

    def get(self, path: str, params: dict = None) -> dict:
        clean = {k: v for k, v in (params or {}).items() if v is not None}
        r = httpx.get(
            f"{self.base}{path}",
            params=clean,
            headers=self._headers(),
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
        r.raise_for_status()
        return r.json()

    def post(self, path: str, data: dict = None) -> dict:
        clean = {k: v for k, v in (data or {}).items() if v is not None}
        r = httpx.post(
            f"{self.base}{path}",
            json=clean,
            headers=self._headers(),
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
        r.raise_for_status()
        return r.json()


def get_or_create(sid: str, session: dict) -> LemmyClient:
    if sid in _clients:
        return _clients[sid]
    instance = session.get("instance", "https://lemmy.world")
    jwt = session.get("jwt")
    client = LemmyClient(instance, jwt)
    _clients[sid] = client
    return client


def store(sid: str, client: LemmyClient):
    _clients[sid] = client


def invalidate(sid: str):
    _clients.pop(sid, None)


def get_anon(instance: str = "https://lemmy.world") -> LemmyClient:
    return LemmyClient(instance)
