---
slug: scrib-doon-mug
name: Scrib Doon Mug
status: draft
created: 2026-10-18T18:30:00Z
updated: 2026-10-18T18:30:00Z
source_brief:
  path: trends/biddy-blas-scrib-doon.md
  stage: peaking
  confidence: medium
  last_verified: 2026-10-18T03:44:00Z
product:
  type: mug
  placement: 11 oz wrap, phrase printed twice so each side faces out
  print_method: sublimation
  print_area_in: [8.5, 3.5]
variants:
  - file: wrap.png
    for: white 11 oz sublimation mug
    colors: ["#141414", "#F2C14E", "#F2F2EE"]
    model: gpt_image_2_5
    prompt: >-
      Flat vector mug wrap print on a solid, plain, flat #F2F2EE background.
      TEXT ONLY: no characters, no creatures, no faces, no people, no icons, no
      objects. The phrase "SCRIB DOON." appears exactly twice, each copy on one
      line: one copy centered in the left half of the frame, one copy centered
      in the right half. Exact spelling: S-C-R-I-B space D-O-O-N followed by a
      period. All caps, ultra-heavy, wide, low-contrast grotesque sans-serif
      like Archivo Black, tight but legible letter spacing, solid flat #141414,
      crisp clean vector edges. Under the word DOON in each copy, one thick
      hand-drawn marker underline stroke in solid #F2C14E. Keep the far left
      and far right edges and the exact center of the frame empty, with wide
      margins top and bottom. No other text, no logo, no sci-fi or space
      styling, no stars, no futuristic lettering, no gradients, no shadows, no
      texture.
    reference: none
    url: https://d8j0ntlcm91z4.cloudfront.net/user_3KqUF1Fx3q7qTVh7yvexPxRBYgz/hf_20261018_182348_07afa504-cdf6-463e-aead-60747aa4d16c.png
    size_px: [3840, 1648]
fonts: []
risk_addressed:
  ip: >-
    Text only. The user approved this angle on 2026-10-18, relayed by the
    coordinator. The art shows only the phrase in brand-style type, with no
    character, helmet, goggles, medallions, silhouette, Star Wars or Lucasfilm
    names, logos, fonts, or sci-fi lettering. No reference still was passed to
    Higgsfield. I viewed the result and confirmed it contains only the two
    words, a period, and a Yolk underline. The flag stays open; see open_risks.
  likeness: No people and no character. The voice actor's name and image don't appear in the art or copy.
  extremist_or_coded: Brief found none. The phrase and underline add no new meaning.
  tragedy_harassment_danger: Brief found none.
open_risks:
  - "risk.ip remains open. Lucasfilm could claim the phrase is associated with its game. The user accepted this risk for the text-only angle; the approval came through the coordinator, not directly from the user."
  - The brand guidelines are still a draft, so this spec stays draft.
  - The lettering is generated to resemble Archivo Black, not set from the font file. If the brand needs the exact typeface, reset the phrase in Archivo Black (SIL OFL 1.1) before print.
  - The brief's visual_signature checked_against is unverified. It doesn't affect a text-only design.
  - "Buyers who haven't seen the clip won't get it (brief: falls_flat). This is a fan in-joke product."
copy:
  title: Scrib Doon Mug
  description: For the person who announces themselves loudly before coffee. Says it twice, in case you missed it the first time.
  tags: [scrib doon, write it down, gaming, meme, mug]
---

## Design notes

The wrap repeats "SCRIB DOON." in each half, so right- and left-handed drinkers
both see one copy. A Yolk marker stroke underlines "DOON" in each copy, the
brief's "write it down" gag. That's the only use of the phrase, which
`remix_guidance.lands` lists as the pattern to use.

- **Resolution.** 3840 × 1648 px on 8.5 × 3.5 in is about 452 × 471 DPI. No upscale needed.
- **Fit.** The image is 2.33:1 and the wrap is 2.43:1. Scale to the full
  3.5 in height and center it. The few extra px at each end are background.
  The text sits well inside the 0.25 in safe margin and clear of the handle
  seam at the wrap ends.
- **Background.** The `#F2F2EE` background stands in for the mug's white. Drop
  it to unprinted white before sublimation so the mug doesn't get a gray tint.
- **Contrast.** Ink text on a white mug is above 16:1. Yolk is a non-text shape only.
- **Spelling.** Checked both copies letter by letter: S-C-R-I-B D-O-O-N, period.
