---
slug: scrib-doon-tee
name: Scrib Doon Tee
status: draft
created: 2026-10-18T18:30:00Z
updated: 2026-10-18T18:30:00Z
source_brief:
  path: trends/biddy-blas-scrib-doon.md
  stage: peaking
  confidence: medium
  last_verified: 2026-10-18T03:44:00Z
product:
  type: t-shirt
  placement: front-center
  print_method: dtg
  print_area_in: [12, 16]
variants:
  - file: light.png
    for: light garments (white, ash, sand)
    colors: ["#141414", "#F2C14E"]
    model: gpt_image_2_5 (generated 2480 x 3312), upscaled with bytedance_image_upscale 4k
    prompt: >-
      Flat vector typographic t-shirt print on a solid, plain, flat #F2F2EE
      background. TEXT ONLY: no characters, no creatures, no faces, no people,
      no icons, no objects. Two words stacked on two centered lines: line 1
      "SCRIB", line 2 "DOON." (with a period). Exact spelling: S-C-R-I-B and
      D-O-O-N followed by a period. All caps, very large, ultra-heavy, wide,
      low-contrast grotesque sans-serif like Archivo Black, tight but legible
      letter spacing, solid flat #141414, crisp clean vector edges. Directly
      under DOON, one thick hand-drawn marker underline stroke in solid
      #F2C14E. No other text, no logo, no sci-fi or space styling, no stars, no
      futuristic lettering, no gradients, no shadows, no texture. Generous
      empty margins.
    reference: none
    url: https://d8j0ntlcm91z4.cloudfront.net/user_3KqUF1Fx3q7qTVh7yvexPxRBYgz/hf_20261018_182513_693950cb-bb42-40bf-b277-bfcd6119326f.png
    source_url: https://d8j0ntlcm91z4.cloudfront.net/user_3KqUF1Fx3q7qTVh7yvexPxRBYgz/hf_20261018_182340_f0b8bb47-db97-4522-847f-3f84a7e81688.png
    size_px: [3072, 4096]
  - file: dark.png
    for: dark garments (black, navy, charcoal)
    colors: ["#F2F2EE", "#F2C14E"]
    model: gpt_image_2_5 (generated 2480 x 3312), upscaled with bytedance_image_upscale 4k
    prompt: >-
      Keep exactly the same design as the reference image: same words "SCRIB"
      and "DOON.", same typeface, same letter shapes, same size, same position,
      same underline stroke shape and position. ONLY these color changes: the
      background becomes solid flat #141414; the letters and the period become
      solid flat #F2F2EE; the underline stroke stays solid flat #F2C14E. Exact
      spelling: S-C-R-I-B and D-O-O-N followed by a period. No other changes,
      no added text, no outlines, no glow, no gradients, no shadows, no
      texture.
    reference: light.png (Higgsfield job f0b8bb47-db97-4522-847f-3f84a7e81688), recolor only
    url: https://d8j0ntlcm91z4.cloudfront.net/user_3KqUF1Fx3q7qTVh7yvexPxRBYgz/hf_20261018_182619_af8c5df0-36dd-4dab-a0d2-5a67a1d93765.png
    source_url: https://d8j0ntlcm91z4.cloudfront.net/user_3KqUF1Fx3q7qTVh7yvexPxRBYgz/hf_20261018_182438_425275f6-d43b-499b-9dde-adb703bdf518.png
    size_px: [3072, 4096]
fonts: []
risk_addressed:
  ip: >-
    Text only. The user approved this angle on 2026-10-18, relayed by the
    coordinator. The art shows only the phrase in brand-style type, with no
    character, helmet, goggles, medallions, silhouette, Star Wars or Lucasfilm
    names, logos, fonts, or sci-fi lettering. No reference still from the
    brief was passed to Higgsfield; the dark variant used only our own light
    variant. I viewed both results and confirmed each contains only the two
    words, a period, and a Yolk underline. The flag stays open; see open_risks.
  likeness: No people and no character. The voice actor's name and image don't appear in the art or copy.
  extremist_or_coded: Brief found none. The phrase and underline add no new meaning.
  tragedy_harassment_danger: Brief found none.
open_risks:
  - "risk.ip remains open. Lucasfilm could claim the phrase is associated with its game. The user accepted this risk for the text-only angle; the approval came through the coordinator, not directly from the user."
  - The brand guidelines are still a draft, so this spec stays draft.
  - Upscaled resolution is about 256 DPI on 12 x 16 in, above the 150 DPI floor but below the 300 DPI ideal.
  - The lettering is generated to resemble Archivo Black, not set from the font file. If the brand needs the exact typeface, reset the phrase in Archivo Black (SIL OFL 1.1) before print.
  - The brief's visual_signature checked_against is unverified. It doesn't affect a text-only design.
  - "Buyers who haven't seen the clip won't get it (brief: falls_flat). This is a fan in-joke product."
copy:
  title: Scrib Doon Tee
  description: Introduce yourself the loud way. Big letters, one underline, zero chance anyone forgets your name.
  tags: [scrib doon, write it down, gaming, meme, t-shirt]
---

## Design notes

The front stacks "SCRIB" over "DOON." in heavy all-caps type. A Yolk marker
stroke underlines the lockup, as if someone took the note. The phrase alone is
the pattern that the brief's `remix_guidance.lands` names: a "write it down"
in-joke for fans. The design leaves out every visual trait of the character on
purpose, per the user's text-only direction.

- **Resolution.** Each variant is 3072 × 4096 px, about 256 DPI on 12 × 16 in.
- **Background.** Remove the flat background before printing: `#F2F2EE` on
  light.png and `#141414` on dark.png. Print only the letters and underline.
- **Light garments.** Ink text on white, ash, or sand is well above 4.5:1. Yolk
  is a non-text shape only, as the brand requires on light surfaces.
- **Dark garments.** Chalk text on black, navy, or charcoal is about 16:1.
  Yolk on dark is about 11:1. There are no Ink shapes, so no Chalk outline is
  needed. DTG needs a white underbase under the Chalk and Yolk areas.
- **Edges.** Flat fills, no gradients or shadows near edges.
- **Spelling.** Checked both variants letter by letter: S-C-R-I-B D-O-O-N, period.
- **Process.** I approved light.png first and then recolored it for dark.png,
  so both variants show the same lettering.
