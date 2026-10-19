---
name: image-review-gap
description: Check at task start that Bash, media_upload, and media_confirm are present; without them, stop instead of generating text-only art
metadata:
  type: project
---

designer.md gives the designer Bash (two guarded curl commands), media_upload, and media_confirm, so it can upload a brief's reference still and download results to review them with Read. These tools only appear after the app reloads agent definitions. In the 2026-10-17 session they were missing, so a regeneration stopped before generating.

**Why:** Text-only prompts without a reference produced art that didn't look like the meme (the black-cat-clapping tee was rejected).

**How to apply:** At the start of a design task, confirm the three tools are present. If any is missing, stop and report it rather than generating without the reference or skipping the visual review. Pitches (`status: pitch`) have no artwork, so this check doesn't apply to them.
