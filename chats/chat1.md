# Lemmy Mobile UI

_Started 2026-05-08 03:34 UTC_

---

## User

I want a mobile ui for lemmy a reddit-style forum app. The app should have home page feed of posts, an inbox, search, settings and profile page. It should use dark mode and maintain a clean style.

## Assistant

_[tool: questions_v2]_

The design system folder is empty, so I'll establish a clean visual system. Let me ask a few focused questions before I start building so I get the direction right.

## User

Questions answered:
- fidelity: Hi-fi clickable prototype with real interactions
- vibe: Decide for me
- accent: 3
- post_style: Card-style with thumbnail (Reddit/Apollo)
- voting: i would like both swipe and up down arrows inline
- screens: Community detail page, Post detail with comment thread, Compose / new post, Login / onboarding, Notifications inbox subscreens (replies / mentions / messages tabs)
- interactions: All of the above
- tweaks: Accent color, Post density (compact / comfortable / spacious), Card style on/off, Show/hide thumbnails, AMOLED pure-black vs charcoal

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

Let me plan a minimal split and write files one by one to keep responses short. I'll start with the HTML shell and theme.

_[tool: snip]_

_[tool: snip]_

Now icons — small, focused SVG icons for the app.

_[tool: write_file]_

## Assistant

Now the icons module:

_[tool: write_file]_

## Assistant

Now the theme tokens:

_[tool: write_file]_

Now icons — a tight set used everywhere:

_[tool: write_file]_

Now sample data — communities, posts, comments, notifications:

_[tool: write_file]_

_[tool: snip]_

Now shared UI primitives (Avatar, Pill, post card, etc.) used across screens:

_[tool: write_file]_

_[tool: snip]_

Now the home feed screen:

_[tool: write_file]_

_[tool: snip]_

Now post detail with comment thread:

_[tool: write_file]_

_[tool: snip]_

Community detail page:

_[tool: write_file]_

_[tool: snip]_

Search screen with live filtering:

_[tool: write_file]_

_[tool: snip]_

Inbox with subtabs:

_[tool: write_file]_

_[tool: snip]_

Profile screen:

_[tool: write_file]_

_[tool: snip]_

Settings screen:

_[tool: write_file]_

_[tool: snip]_

Compose new post screen:

_[tool: write_file]_

_[tool: snip]_

Login / onboarding screen:

_[tool: write_file]_

_[tool: snip]_

Now the root App with navigation, tab bar, and tweaks panel:

_[tool: write_file]_

_[tool: snip]_

Now let me verify it loads:

_[tool: show_html]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built a hi-fi clickable Lemmy prototype with:

- **Onboarding** → instance picker (5 servers) → sign in/up
- **Home** with Subscribed/Local/All scopes, Hot/New/Top sort, pull-to-refresh, floating compose
- **Card posts** with vote arrows + horizontal **swipe-to-vote** (drag right = upvote, left = downvote, threshold-based)
- **Post detail** with collapsible threaded comments, depth-cycling stripe colors, OP badge
- **Community page** with banner, stats, posts/about/mods tabs
- **Search** with live filtering across communities/posts/users + recent + trending tags
- **Inbox** with replies/mentions/messages tabs, unread dots, mark-all-read
- **Profile** with posts/comments/saved/upvoted tabs
- **Settings** mirroring the Tweaks
- **Compose** with text/link/image type toggle, community picker, tags

**Tweaks** (bottom-right): accent color (5), AMOLED pure-black, density (compact/regular/spacious), card style on/off, thumbnails on/off.

## User

Export this design as a PPTX (screenshot mode): Lemmy.html

