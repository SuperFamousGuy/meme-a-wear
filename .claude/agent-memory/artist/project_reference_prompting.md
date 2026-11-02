---
name: reference-prompting
description: Passing the brief's still plus explicit anatomy and redraw wording got a recognizable meme design on the first try
metadata:
  type: project
---

On 2026-10-18, the not-me-nan tee passed review on the first attempt with gpt_image_2_5 (3:4, 4k, quality high). It passed the still as `image_references` and named the anatomy ("dog paws, no human hands") and the redraw rule ("no photo pixels, no background from the reference, no people"). Output was 2480x3312, about 207 DPI on 12x16 in, so plan to upscale for 300 DPI.

On 2026-10-18, the tra-la-la tee (a still of a copyrighted cartoon) also passed on the first try. The prompt asked for an ORIGINAL character, used the still "only for pose, proportions, and mouth", and gave an explicit "do NOT draw" list of the character's identifiers (body shape, pores, lashes, eye color, clothes, setting). The model dropped every listed identifier and kept the gag.

On 2026-10-18, the losercore tee used a two-panel still whose right panel was off-limits (an IP-risky AI couple). Telling the model "use ONLY the LEFT panel ... IGNORE the right panel completely" plus "no blue or pink, no realistic people" kept every trace of the right panel out on the first try.

On 2026-10-18, the coordinator rejected the whats-up-brah tee because the light and dark variants, generated in parallel from the same prompt, showed different characters. Fix: approve light.png first, then generate dark.png with the light job_id as the only `image_references` and a recolor-only prompt ("keep exactly the same drawing... ONLY these changes"). It matched on the first try.

On 2026-10-18, the tra-la-la-7am-mug wrap passed on the first try with the same structure, at 21:9, 4k, quality high. Output was 3840x1648, about 452 DPI on 8.5 in, so mug wraps need no upscale. Placing the figure in "LEFT 60 PERCENT" and the caption in "RIGHT 35 PERCENT" held the layout.

On 2026-10-18, the same left-panel wording passed first try for a 21:9 mug wrap (3840x1648, about 450 DPI, no upscale) and a 1:1 sticker (2880x2880). One batch item returned 429 rate_limit_reached with no job; resubmitting that item alone worked.

On 2026-10-18, a mug wrap and a sticker reused the whats-up-brah mascot by passing two references: the brief's still "ONLY for the body pose" and the approved light.png job_id "for the character design". Both kept the same mascot on the first try. gpt_image_2_5 returned 429 rate_limit_reached on several submits; plain retries worked after a minute. nano_banana_pro needs a plus plan on this account.

On 2026-10-18, gpt_image_2_5 returned 429 rate_limit_reached twice. nano_banana_2_1 (4k, thinking_level high) took the same prompts and passed on the first try: correct spelling, 21:9 and 16:9 both fine, and 4k 21:9 gave 6336x2688. It doesn't set Archivo Black or straight apostrophes either.

On 2026-10-18, the clapping-cat hoodie and sticker drew TWO rows of teeth even though the prompt said "one row". An edit pass (previous job_id as first reference, still as second, "ONLY this change: ONE single row of upper teeth, NO lower teeth") fixed it and kept everything else. Hands held apart got fixed the same way ("palm to palm mid-clap, front hand overlapping"). The dark recolor's "thick" Chalk outline came out about 12 px on 2880 px, under the 0.12 in brand minimum; ask for an explicit stroke width (about 1 percent of image width) up front. gpt_image_2_5 hit HTTP 429 often that day; write specs while waiting.

On 2026-10-18 (fat-talking-tom briefs), recolor prompts gave dark-variant Chalk outlines of only 0.05 to 0.065 in, even when asked for "very thick, about one percent of the image width". The brand minimum is 0.12 in. Ask for about 2.5 percent of the width, or flag it for vector cleanup. The shell guard also rejects the upload curl with an absolute path. Use the exact relative `trends/refs/<file>` form. When gpt_image_2_5 returned 429 for one prompt three times, a shorter prompt that reused an approved job as its reference went through.

On 2026-10-18, the tip-toein imp tee recolor asked for a "thick" Chalk outline but got about 0.065 in at print size, half the brand's 0.12 in minimum. Name the stroke in pixels (for example, "outline about 30 px wide at 3072 px canvas width"). The same session hit gpt_image_2_5 429 errors and a four-concurrent-job cap. A rejected item creates no job, so resubmitting it is safe.

**Why:** The text-only clapping-cat attempts were rejected. See [[image-review-gap]].

**How to apply:** Reuse this prompt structure for new designs. For garments, generate and approve light first, then recolor it for dark; don't batch both from one prompt. Expect 4k 3:4 output to need upscale_image before production.
