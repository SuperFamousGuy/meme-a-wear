---
name: image-review-gap
description: Check at task start that Bash, media_upload, and media_confirm are present; without them, stop instead of generating text-only art
metadata:
  type: project
---

artist.md gives the artist Bash (two guarded curl commands), media_upload, and media_confirm, so it can upload a brief's reference still and download results to review them with Read. These tools only appear after the app reloads agent definitions. In the 2026-10-17 session they were missing, so a regeneration stopped before generating.

**Why:** Text-only prompts without a reference produced art that didn't look like the meme (the black-cat-clapping tee was rejected).

On 2026-11-02 (snow-leopard sticker), Higgsfield had 1 credit, and an image job costs about 3, so the variant became a hand-written SVG. Read shows an SVG as text, and Bash allows only curl, so the SVG couldn't be rendered for review, and no mockup was possible. Flag both in open_risks and ask a person to open the SVG. The same happened for the w-chews-l-nibbles sticker pair later that day. A Write hook opens each new SVG in the user's Browser pane, so tell the user it's already there to review. For the w-chews mug wrap (same day), wrapping each sticker's art in `translate(cx cy) scale(s) translate(-cx0 -cy0)` kept the sibling geometry identical with no redrawing; light-background panels need Ink outlines added to Chalk shapes. For the snow-leopard hoodie (same day), the same scale-wrap reused the sticker leopard; on the dark variant, a Chalk-filled copy of the outer shapes underneath with a wide Chalk stroke (width/2 minus the Ink half-stroke, times scale, at least 120 units) met the 0.12 in edge rule.

**How to apply:** At the start of a design task, confirm the three tools are present. If any is missing, stop and report it rather than generating without the reference or skipping the visual review.
