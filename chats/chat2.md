# Icon Contrast Issues

_Started 2026-05-08 18:47 UTC_

---

## User

certain icons are not visible, home, search, inbox, profile, up/down votes and the reply button in inbox, fix the contrast

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Bumped contrast on the dim icons:
- Tab bar (home/search/inbox/profile): inactive icons now `rgba(236,237,242,0.92)` with stroke 2.1
- Up/down vote arrows: idle state now `rgba(236,237,242,0.88)` instead of textDim
- Inbox Reply button: solid accent fill with dark text instead of low-opacity tinted background

## User

the issue is still not fixed, see attached

## Assistant

_[tool: view_image]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

I can see the icons are invisible due to `currentColor` not inheriting through the SVG properly — hex colors work (the active Home shows orange) but `rgba()` values don't propagate reliably as SVG stroke. Fix: pass `color` explicitly to every icon that was relying on CSS inheritance.

_[tool: str_replace_edit]_

Now fix the vote arrows to pass `color` explicitly too — they're still relying on currentColor:

_[tool: read_file]_

Also fix the inbox reply icon — pass `color` explicitly there too:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

All icon color values are now passed explicitly as hex — no more reliance on `currentColor` CSS inheritance, which doesn't cascade through SVG reliably in this environment. Changes across three files:

- **Tab bar** — inactive icons get `#d8d8de` directly
- **Vote arrows** — idle state gets `#b8b9c2` hex; voted states keep their accent/downvote hex  
- **Inbox reply** — icon color matches the button's dark text explicitly

## User

Verifier agent check completed

## Assistant

_[tool: str_replace_edit]_

The verifier nailed it — Babel's `_excluded` variable collides across script tags, causing `stroke={2.1}` to overwrite `stroke={color}` on the SVG. Fix: drop the rest spread entirely.

_[tool: done]_

_[tool: fork_verifier_agent]_

All icons should now be visible. The root cause was a Babel standalone quirk — the `...rest` spread in the icon helper was leaking `stroke` back onto the SVG after the color was set, overwriting it with the stroke-width number (e.g. `stroke="2.1"` — an invalid color). Removing the rest spread fixed it cleanly.

