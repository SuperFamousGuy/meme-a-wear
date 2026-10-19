---
name: design-spec
description: Schema and print rules for product design specs in this project's design store (designs/). Use when you write, update, review, or produce from a design spec — for example, when the designer agent turns a trend brief into a t-shirt, hoodie, or mug design, or when a printer or developer needs to know what a design contains. Defines the required fields, the default print limits per product, the light and dark garment rules, and how a design records the trend brief and risks it came from.
---

# Design spec

A design spec is the contract between the `designer` agent and the people who
print or sell a design. The designer writes specs. Other agents and people read
them.

## Store layout

- `designs/<slug>/spec.md`: one spec per design. The slug is lowercase
  kebab-case and never changes.
- `designs/<slug>/<variant>.png`: one image per artwork variant that the
  spec lists, generated with Higgsfield. Garments use `light.png` and
  `dark.png`. Other products use one file per print surface, such as
  `wrap.png` for a mug. The designer downloads each result to this path to
  review it. Older designs use SVG.
- `designs/<slug>/mockup-<variant>.png`: one sales mockup per variant, such
  as `mockup-light.png`. It shows the printed product for sales and
  marketing. Printers never print from it. Older designs may have none.
- `designs/no-go/<slug>/`: a pitch or design that marketing rated NO-GO,
  moved here whole. Agents skip `designs/no-go/` unless the user asks for
  it.
- `designs/stale/<slug>/`: a design whose trend brief the meme-expert moved
  to `trends/stale/`, moved here whole. Its viability report and marketing
  page move to `marketing/stale/`. Agents skip both unless the user asks.
- `brand/`: the brand guidelines, logo, and brand copy. Every design follows
  `brand/guidelines.md`.
- `storefront/`: storefront specs and HTML mockups.

## Schema

The example shows the shape of a spec. Its values are illustrative.

```yaml
---
slug: clapping-cat-skip-class-tee
name: Clapping Cat, Skip Class Edition
status: draft               # pitch | draft | ready | retired
created: 2026-10-13T15:00:00Z
updated: 2026-10-13T15:00:00Z
source_brief:
  path: trends/black-cat-clapping.md
  stage: emerging           # copied from the brief when you designed
  confidence: low
  last_verified: 2026-10-13T11:40:00Z
product:
  type: t-shirt             # t-shirt | hoodie | mug | sticker | other
  placement: front-center
  print_method: dtg         # dtg | screen | sublimation | digital | unknown
  print_area_in: [12, 16]   # width, height in inches
variants:
  - file: light.png
    for: light garments (white, ash, sand)
    colors: ["#111111", "#F2C14E"]
    model: gpt_image_2_5       # the Higgsfield model you used
    prompt: Flat vector-style illustration of a black cat clapping...
    reference: trends/refs/black-cat-clapping.jpg   # the brief's still, or none
    url: https://...           # the Higgsfield result URL
    size_px: [2048, 2731]
  - file: dark.png
    for: dark garments (black, navy, charcoal)
    colors: ["#F5F5F5", "#F2C14E"]
    model: gpt_image_2_5
    prompt: Flat vector-style illustration of a black cat clapping...
    url: https://...
    size_px: [2048, 2731]
mockups:                    # one per variant; for marketing, never for print
  - file: mockup-light.png
    variant: light.png
    shows: white tee, flat lay on light wood
    model: gpt_image_2_5
    prompt: Photorealistic flat lay of a white crew-neck t-shirt with the supplied artwork printed front-center...
    url: https://...
    size_px: [2048, 2048]
  - file: mockup-dark.png
    variant: dark.png
    shows: black tee on a wooden hanger, concrete wall
    model: gpt_image_2_5
    prompt: Photorealistic black crew-neck t-shirt on a wooden hanger with the supplied artwork...
    url: https://...
    size_px: [2048, 2048]
fonts: []                   # only for SVG designs; generated text has no font file
risk_addressed:             # one entry for each risk field in the brief
  ip: Original drawing. No frames from the source reel.
  likeness: No people shown. The cat is not the uploader's cat.
  extremist_or_coded: Brief found none. The caption adds no new meaning.
  tragedy_harassment_danger: Brief found none.
open_risks:
  - The brief's confidence is low. The trend may fade before stock sells.
copy:
  title: Clapping Cat Tee
  description: A black cat with a too-human smile applauds your worst idea today.
  tags: [cat, meme, school]
---

## Design notes

What the design shows, why the caption fits the brief's `remix_guidance`, and
anything a printer must know, such as halftones or a knockout.
```

All fields are required. Write `unknown` when you can't determine a value,
and explain why in the notes. Never leave `risk_addressed` empty for a risk
field that the brief marks as a concern or `unknown`.

## Status

- `pitch`: a product idea with no artwork yet. See Pitches.
- `draft`: the artwork or copy is incomplete, the brand guidelines are still a
  draft, or an open risk needs a decision from the user.
- `ready`: the artwork, copy, and risk notes are complete, and the brand
  guidelines are approved.
- `retired`: don't print it. Say why in the notes. For example, the trend
  became `do-not-use`.

## Pitches

A pitch proposes a product so that marketing can judge it before anyone
makes artwork. It uses the same `spec.md` and schema, with these changes:

- `status: pitch`, and `variants`, `mockups`, and `fonts` are `[]`.
- `product`, `source_brief`, `risk_addressed`, `open_risks`, and `copy` are
  complete. `open_risks` includes "No artwork yet."
- The body starts with a `## Pitch` section of up to 200 words: the product,
  the caption, the art direction (the brief traits it keeps and what it
  changes), the buyer and why they buy it, and why the timing works now.
  `## Design notes` follows it.
- A pitch keeps `status: pitch` while the brand guidelines are a draft. Add
  "Brand guidelines not yet approved" to `open_risks` instead.

When the pitch gets artwork, the designer adds the variants and mockups and
changes the status to `draft`.

## Print rules

These are defaults. A printer's own template overrides them. Record the
template's source in the notes when you use one.

| Product | Print area (in) | Default method | Color limit |
|---|---|---|---|
| T-shirt, front | 12 × 16 | DTG | None for DTG. Four spot colors for screen print. |
| Hoodie, front | 12 × 12 | DTG | Same as the t-shirt. Keep clear of the pocket and drawstrings. |
| Mug, 11 oz wrap | 8.5 × 3.5 | Sublimation | None. Keep key content 0.25 in from each edge and clear of the handle. |
| Sticker | 3 × 3 | Digital | None. Add 0.125 in bleed. |

### Artwork

- Generate each variant with Higgsfield. Pick an aspect ratio that matches
  the print area, such as 3:4 for a 12 × 16 in t-shirt.
- Use hand-written SVG only as a last resort, when Higgsfield is out of
  credits or can't be reached. Record that reason in `open_risks` and keep
  the spec `draft`.
- Ask for a flat, isolated illustration on a solid background that the
  printer can remove. Avoid photographic backgrounds, soft shadows, and
  fine gradients near edges.
- Name the brand colors as hex values in the prompt, and list the colors the
  result uses in `colors`.
- Keep captions short. Check every generated letter for spelling. Regenerate
  the image if any letter is wrong or malformed.
- Record the effective resolution: `size_px` divided by `print_area_in`.
  DTG prints best at 300 DPI. Below 150 DPI, upscale the image with
  Higgsfield's `upscale_image` and record the upscaled URL and size. If it
  is still below 150 DPI, add that to `open_risks` and keep the spec `draft`.
- The design must look like the meme. Pass the brief's reference still to
  Higgsfield for pose, face, and expression, and redraw it as an original
  illustration. Don't copy the frame itself: no photo pixels, no background
  from the frame, and no people.
- Generated art must not resemble a real person, a character, or a logo.
  Record how you checked this, and which reference you used, in
  `risk_addressed.ip`.

### Mockups

- Make one mockup per variant. Generate it with Higgsfield, and pass the
  variant image in `medias` so the print matches the artwork.
- Show the product only: a flat lay, a hanger, or a ghost mannequin for
  garments, and a tabletop scene for mugs and stickers. Never show a person,
  hands, or a face.
- Put the art on a product color that the variant's `for` names, in its
  `placement`, at a realistic print size.
- The printed art must match the variant: same text, spelling, colors, and
  shapes. Regenerate the mockup if it doesn't.
- Add no logos, brand names, or text other than the art's own, except the
  meme-a-wear logo if `brand/guidelines.md` allows it.
- A missing or failed mockup doesn't block `ready`. List it in `open_risks`.

### Light and dark garments

- These rules apply to garments only. Mugs, stickers, and other products
  need one variant per print surface, printed on a known background color.
- Make a separate variant for each garment group. Don't rely on the garment
  color to fill shapes unless the notes say so.
- Check that every text color has a contrast ratio of at least 4.5:1 against
  its garment color.
- On dark garments, DTG needs a white underbase. Avoid fine gradients near
  the edges of shapes.

## Linking to the trend brief

- `source_brief.path` points to the brief. Copy its stage, confidence, and
  `last_verified` when you design, so a later reader can see if the brief has
  changed since.
- Never design from a brief marked `do-not-use`.
- Never design from a stale brief. The `trend-brief` skill defines stale.
