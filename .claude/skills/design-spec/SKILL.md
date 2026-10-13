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
- `designs/<slug>/<variant>.svg`: one SVG file per artwork variant that the
  spec lists. Garments use `light.svg` and `dark.svg`. Other products use one
  file per print surface, such as `wrap.svg` for a mug.
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
  print_method: dtg         # dtg | screen | sublimation | unknown
  print_area_in: [12, 16]   # width, height in inches
variants:
  - file: light.svg
    for: light garments (white, ash, sand)
    colors: ["#111111", "#F2C14E"]
  - file: dark.svg
    for: dark garments (black, navy, charcoal)
    colors: ["#F5F5F5", "#F2C14E"]
fonts:
  - name: Archivo Black
    license: SIL OFL 1.1
    source: https://fonts.google.com/specimen/Archivo+Black
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

- `draft`: the artwork or copy is incomplete, the brand guidelines are still a
  draft, or an open risk needs a decision from the user.
- `ready`: the artwork, copy, and risk notes are complete, and the brand
  guidelines are approved.
- `retired`: don't print it. Say why in the notes. For example, the trend
  became `do-not-use`.

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

- Set the SVG `viewBox` to the print area at 100 units per inch. For example,
  a 12 × 16 in area is `viewBox="0 0 1200 1600"`. Set `width` and `height` in
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
