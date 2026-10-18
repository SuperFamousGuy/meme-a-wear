---
name: higgsfield-concurrency
description: Higgsfield starter plan caps concurrent jobs at 4; 429 rate_limit_reached on submit usually means too many active jobs, not exhausted credits
metadata:
  type: project
---

On 2026-10-18, batch submits failed with `429 rate_limit_reached` on two different models (gpt_image_2_5, recraft_v4_1), then a single submit worked moments later. upscale_image then reported the cause directly: "max 4 concurrent job(s) on starter (annual) plan."

On 2026-10-18 (mockup backfill), single-item submits on both gpt_image_2_5 and nano_banana_2_1 got 429 four times in a row, so switching models doesn't help when the limit is account-wide. Other sessions sharing the account probably held the job slots. Uploads still worked. Stop after two single-item 429s and report, instead of burning turns.

On 2026-10-18 (mockup backfill), a 7-item gpt_image_2_5 batch got 4 jobs and 3 rejections with 429. One resubmit got 429 again while only one job was active, so the 429 also comes from a short-term rate limit. A retry about a minute later went through. All 7 mockups (variant passed as `image_references`, "exactly as supplied" wording) passed review on the first try.

**Why:** A 429 looked like Higgsfield was unreachable, which would have triggered the SVG fallback too early.

**How to apply:** Keep at most 3-4 jobs in flight. Upscale only after generations finish. On a 429, retry with fewer jobs before treating Higgsfield as unavailable. See [[reference-prompting]].
