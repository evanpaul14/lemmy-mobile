from datetime import datetime, timezone
from urllib.parse import urlparse
from typing import Optional


def relative_time(published: str) -> str:
    try:
        dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        delta = (datetime.now(timezone.utc) - dt).total_seconds()
        if delta < 60:
            return "now"
        if delta < 3600:
            return f"{int(delta // 60)}m"
        if delta < 86400:
            return f"{int(delta // 3600)}h"
        if delta < 604800:
            return f"{int(delta // 86400)}d"
        return f"{int(delta // 604800)}w"
    except Exception:
        return "?"


def extract_instance(actor_id: str) -> str:
    try:
        return urlparse(actor_id).hostname or ""
    except Exception:
        return ""


def format_count(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)


def detect_kind(url: Optional[str]) -> str:
    if not url:
        return "text"
    lower = url.lower().split("?")[0]
    image_exts = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg")
    if any(lower.endswith(ext) for ext in image_exts):
        return "image"
    return "link"


def _post_lists(result) -> list:
    """Normalise pythorhead post.list() return value."""
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get("posts", [])
    return []


def transform_post(pv: dict) -> dict:
    post = pv.get("post", {})
    creator = pv.get("creator", {})
    community = pv.get("community", {})
    counts = pv.get("counts", {})

    url = post.get("url")
    kind = detect_kind(url)
    thumb_url = post.get("thumbnail_url")

    thumb = None
    if kind == "image":
        thumb = url or thumb_url
    elif kind == "link":
        thumb = thumb_url

    my_vote = pv.get("my_vote")
    votes = "up" if my_vote == 1 else "down" if my_vote == -1 else None

    community_name = community.get("name", "")
    community_instance = extract_instance(community.get("actor_id", ""))
    creator_name = creator.get("name", "")
    creator_instance = extract_instance(creator.get("actor_id", ""))

    return {
        "id": post.get("id"),
        "community": community_name,
        "author": creator_name,
        "age": relative_time(post.get("published", "")),
        "title": post.get("name", ""),
        "body": post.get("body") or "",
        "url": url,
        "kind": kind,
        "thumb": thumb,
        "score": counts.get("score", 0),
        "votes": votes,
        "comments": counts.get("comments", 0),
        "saved": pv.get("saved", False),
        "tag": None,
        "communityRef": {
            "id": community_name,
            "name": community_name,
            "instance": community_instance,
            "members": format_count(counts.get("subscribers", 0)),
            "desc": community.get("description") or "",
            "cover": "abstract",
            "avatar": None,
        },
        "authorRef": {
            "id": creator_name,
            "name": creator_name,
            "instance": creator_instance,
            "avatar": None,
        },
    }


def transform_community(cv: dict) -> dict:
    community = cv.get("community", {})
    counts = cv.get("counts", {})
    subscribed = cv.get("subscribed", "NotSubscribed")

    name = community.get("name", "")
    instance = extract_instance(community.get("actor_id", ""))

    return {
        "id": name,
        "name": name,
        "instance": instance,
        "members": format_count(counts.get("subscribers", 0)),
        "desc": community.get("description") or "",
        "cover": "abstract",
        "subscribed": subscribed in ("Subscribed", "Pending"),
        "avatar": None,
    }


def transform_user(uv: dict) -> dict:
    person = uv.get("person", {})
    return {
        "id": person.get("name", ""),
        "name": person.get("name", ""),
        "instance": extract_instance(person.get("actor_id", "")),
        "avatar": None,
    }


def build_comment_tree(comment_views: list) -> list:
    """Convert a flat list of CommentView dicts into a nested tree."""
    nodes: dict[int, dict] = {}

    for cv in comment_views:
        comment = cv.get("comment", {})
        creator = cv.get("creator", {})
        counts = cv.get("counts", {})
        my_vote = cv.get("my_vote")

        path = comment.get("path", "0")
        comment_id = comment.get("id")
        if comment_id is None:
            continue

        depth = max(0, path.count(".") - 1)
        votes = "up" if my_vote == 1 else "down" if my_vote == -1 else None

        nodes[comment_id] = {
            "id": comment_id,
            "author": creator.get("name", ""),
            "age": relative_time(comment.get("published", "")),
            "score": counts.get("score", 0),
            "votes": votes,
            "body": comment.get("content", ""),
            "depth": depth,
            "op": cv.get("creator_is_post_creator", False),
            "authorRef": {
                "id": creator.get("name", ""),
                "name": creator.get("name", ""),
                "instance": extract_instance(creator.get("actor_id", "")),
                "avatar": None,
            },
            "_path": path,
            "replies": [],
        }

    roots: list = []
    for cv in comment_views:
        comment = cv.get("comment", {})
        comment_id = comment.get("id")
        if comment_id not in nodes:
            continue

        path = nodes[comment_id]["_path"]
        parts = path.split(".")

        if len(parts) <= 2:  # root: "0.X"
            roots.append(nodes[comment_id])
        else:
            parent_id = int(parts[-2])
            if parent_id in nodes:
                nodes[parent_id]["replies"].append(nodes[comment_id])
            else:
                roots.append(nodes[comment_id])

    return roots


# ── Inbox transforms ─────────────────────────────────────────────────────────

def transform_reply(rv: dict) -> dict:
    comment = rv.get("comment", {})
    creator = rv.get("creator", {})
    post = rv.get("post", {})
    reply_meta = rv.get("comment_reply", {})

    post_title = post.get("name", "")
    context = (post_title[:57] + "…") if len(post_title) > 57 else post_title

    return {
        "id": reply_meta.get("id") or comment.get("id"),
        "kind": "reply",
        "from": creator.get("name", ""),
        "fromRef": {
            "id": creator.get("name", ""),
            "name": creator.get("name", ""),
            "instance": extract_instance(creator.get("actor_id", "")),
            "avatar": None,
        },
        "age": relative_time(comment.get("published", "")),
        "unread": not reply_meta.get("read", True),
        "title": "replied to your post",
        "context": context,
        "body": comment.get("content", ""),
    }


def transform_mention(mv: dict) -> dict:
    comment = mv.get("comment", {})
    creator = mv.get("creator", {})
    community = mv.get("community", {})
    mention_meta = mv.get("person_mention", {})

    return {
        "id": mention_meta.get("id") or comment.get("id"),
        "kind": "mention",
        "from": creator.get("name", ""),
        "fromRef": {
            "id": creator.get("name", ""),
            "name": creator.get("name", ""),
            "instance": extract_instance(creator.get("actor_id", "")),
            "avatar": None,
        },
        "age": relative_time(comment.get("published", "")),
        "unread": not mention_meta.get("read", True),
        "title": "mentioned you",
        "context": f"in c/{community.get('name', '')}",
        "body": comment.get("content", ""),
    }


def transform_message(pm: dict) -> dict:
    msg = pm.get("private_message", {})
    creator = pm.get("creator", {})

    return {
        "id": msg.get("id"),
        "kind": "message",
        "from": creator.get("name", ""),
        "fromRef": {
            "id": creator.get("name", ""),
            "name": creator.get("name", ""),
            "instance": extract_instance(creator.get("actor_id", "")),
            "avatar": None,
        },
        "age": relative_time(msg.get("published", "")),
        "unread": not msg.get("read", True),
        "title": "sent you a message",
        "context": "",
        "body": msg.get("content", ""),
    }
