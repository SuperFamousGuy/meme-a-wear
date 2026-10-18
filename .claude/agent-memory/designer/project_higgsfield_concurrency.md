---
name: higgsfield-concurrency
description: Higgsfield starter plan caps concurrent jobs at 4; 429 rate_limit_reached on submit usually means too many active jobs, not exhausted credits
metadata:
  type: project
---

On 2026-10-18, batch submits failed with `429 rate_limit_reached` on two different models (gpt_image_2_5, recraft_v4_1), then a single submit worked moments later. upscale_image then reported the cause directly: "max 4 concurrent job(s) on starter (annual) plan."

**Why:** A 429 looked like Higgsfield was unreachable, which would have triggered the SVG fallback too early.

**How to apply:** Keep at most 3-4 jobs in flight. Upscale only after generations finish. On a 429, retry with fewer jobs before treating Higgsfield as unavailable. See [[reference-prompting]].
