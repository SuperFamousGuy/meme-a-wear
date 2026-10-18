---
name: source-notes
description: Which trend sources worked or failed during research, and how to reach them (KYM pages, Bluesky API status, time lookup, independence rules)
metadata:
  type: reference
---

Source behavior observed on 2026-10-13. Re-test failures before relying on them.

- **Bluesky public API returned HTTP 403** on `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`. Try once per session. If it fails, note "no Bluesky data" in briefs.
- **KYM front page** (`knowyourmeme.com/`) lists the newest entries and editorials with relative times. It's the fastest way to find this week's memes. `knowyourmeme.com/memes/trending` returns 404.
- **KYM Weekly Meme Roundup** editorials cover about five fresh memes each. Search for "The Weekly Meme Roundup".
- **KYM Meme of the Month** poll and "See the winner" pages give a monthly ranked list with vote shares.
- KYM editorial URLs redirect (301) to `trending.knowyourmeme.com/editorials/guides/...`. This is the same publisher, so follow the redirect.
- **Independence.** KYM entries, editorials, and polls count as one publisher. meme.com pages restate KYM, so they don't count as independent either. NBC local-station sites (nbcwashington, nbcbayarea, and so on) syndicate one NBC News story, so cite one of them.
- Generic "trending memes <month>" searches return stale SEO listicles. Prefer KYM editorials, then search news for each meme by name.
- **Yahoo** (yahoo.com/entertainment, sg.news.yahoo.com) republishes KYM explainers under the same title and byline. Not independent. mendoi-apps.com cites KYM too. popcreep.com didn't cite KYM (2026-10-17).
- **TikTok oEmbed works** for videos: `https://www.tiktok.com/oembed?url=<video URL>` returns caption and author. Photo posts return 400. Plain TikTok pages return nothing. Date a post from its ID: `id >> 32` is Unix seconds. X IDs: `(id >> 22) + 1288834974657` is Unix ms.
- **Fresh memes aren't in the search index.** WebSearch "standard" mode missed memes 1–2 weeks old. "extended" mode found them.
- **last30days wrapper** (fixed 2026-10-18): run `research '<topic>' trends/plans/<slug>.json`. Without a plan, it exits 2. Plan JSON fields: intent, freshness_mode "strict_recent", cluster_mode, and subqueries (label, search_query, ranking_query, sources, weight). The engine kept only 2 of 3 subqueries. It returns Reddit and YouTube only. Meme-name queries for TikTok/X memes found nothing on Reddit or YouTube, and broad queries surfaced generic threads. Use it to find leads and check Reddit traction, not to confirm stages. KYM roundups stay the main source for new memes.
- **Blocked on 2026-10-18:** WebSearch `allowed_domains: reddit.com` (400), X oEmbed `publish.x.com` (402), YouTube watch pages (Google captcha), Empire, meme.fandom.com (402), Just Jared, Thunderdungeon, Cybernews (403). Fresh memes often have only KYM coverage, so confidence ends up low.
- **Add a query param** (for example `&v=2`) to timeapi.io to get past the WebFetch cache.
- **Current UTC time.** WebFetch caches timeapi.io for 15 minutes, so a second call returns the old time. `worldtimeapi.org` reset the connection. `https://timeapi.io/api/Time/current/zone?timeZone=UTC` worked.
