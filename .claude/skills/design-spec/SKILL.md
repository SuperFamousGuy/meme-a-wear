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
- `designs/<slug>/<variant>.png`: one file per artwork variant that the spec
  lists. Garments use `light.png` and `dark.png`. Other products use one file
  per print surface, such as `wrap.png` for a mug. Logos and designs that are
  type alone may use hand-written `.svg` files instead.
- `designs/<slug>/prompt.md`: the prompt that generated the chosen art.
- `designs/<slug>/candidates/`: every generated image. Git ignores this
  directory, so only the chosen files are committed.
- `brand/`: the brand guidelines, logo, and brand copy. Every design follows
  `brand/guidelines.md`.
- `storefront/`: storefront specs and HTML mockups.

## Schema

The example shows the shape of a spec. Its values are illustrative.

```yaml
---
slug: clapping-cat-skip-class-tee
name: Clapping Cat, Skip Class Edition
status: draft               # draft | ready | retired
created: 2026-10-13T12:00:00Z
updated: 2026-10-13T12:00:00Z
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
artwork:
  method: generated         # generated | hand-drawn
  provider: google          # google | recraft | none
  prompt: prompt.md
  background_removed: false # true once the background is transparent
variants:
  - file: light.png
    for: light garments (white, ash, sand)
    pixels: [3072, 4096]    # width, height, as the script prints them
    dpi: 256                # pixel width ÷ print width in inches
  - file: dark.png
    for: dark garments (black, navy, charcoal)
    pixels: [3072, 4096]
    dpi: 256
fonts: none                 # generated lettering; list fonts for hand-drawn type
risk_addressed:             # one entry for each risk field in the brief
  ip: Original generated art. No frames from the source reel, and no candidate that resembles one.
  likeness: No people shown. The cat is not the uploader's cat.
  extremist_or_coded: Brief found none. The caption adds no new meaning.
  tragedy_harassment_danger: Brief found none.
open_risks:
  - The brief's confidence is low. The trend may fade before stock sells.
  - The background isn't removed, and 256 DPI is below the 300 DPI target.
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

- `draft`: the artwork or copy is incomplete, the brand guidelines are still a
  draft, or an open risk needs a decision from the user.
- `ready`: the artwork, copy, and risk notes are complete, generated art has
  its background removed and is at print size, and the brand guidelines are
  approved.
- `retired`: don't print it. Say why in the notes. For example, the trend
  became `do-not-use`.

## Print rules

These are defaults. A printer's own template overrides them. Record the
template's source in the notes when you use one.

| Product | Print area (in) | Default method | Color limit | Generate with | Pixels at 300 DPI |
|---|---|---|---|---|---|
| T-shirt, front | 12 × 16 | DTG | None for DTG. Four spot colors for screen print. | `--aspect 3:4 --size 4K` | 3600 × 4800 |
| Hoodie, front | 12 × 12 | DTG | Same as the t-shirt. Keep clear of the pocket and drawstrings. | `--aspect 1:1 --size 4K` | 3600 × 3600 |
| Mug, 11 oz wrap | 8.5 × 3.5 | Sublimation | None. Keep key content 0.25 in from each edge and clear of the handle. | `--aspect 21:9 --size 4K` | 2550 × 1050 |
| Sticker | 3 × 3 | Digital | None. Add 0.125 in bleed. | `--aspect 1:1 --size 2K` | 975 × 975, with bleed |

### Generated art

- Deliver PNG files at print size. Aim for 300 DPI, and record the actual DPI
  in `variants`. The script prints each file's pixel size.
- Remove the background before a design is `ready`, so only the art prints.
- Check every letter of generated text against the caption. Image models
  often misspell words.
- Keep the subject inside the print area, with the margins the table above
  lists.

### Hand-drawn SVG

Use these rules for logos and designs that are type alone.

- Set the SVG `viewBox` to the full canvas at 100 units per inch. The canvas
  is the print area plus any bleed on each edge. For example, a 12 × 16 in
  area is `viewBox="0 0 1200 1600"`, and a 3 × 3 in sticker with 0.125 in
  bleed is `viewBox="0 0 325 325"`. Set `width` and `height` in
  inches.
- Use only colors from `brand/guidelines.md` or the spec's `variants`. Write
  colors as hex values.
- Use no raster images, filters, or blurs. Some printers drop them.
- Make lines and text at least 0.03 in (3 units) thick, so they survive
  printing on fabric.
- Use only fonts with a license that allows commercial use, such as SIL OFL.
  Name each font in `fonts`. The printer converts text to outlines.

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
