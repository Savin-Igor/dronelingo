## Goal

Automated content pipeline: daily news search → editorial queue → trilingual blog post every 3 days → PR for human review.

## Context

- Blog posts live in `content/blog/<en-slug>/` — each dir has `en.mdx`, `lv.mdx`, `ru.mdx`, `meta.yml`, `seo.yml`
- Queue file: `content/blog/.news-queue.json`
- Two Claude Code scheduled agents (via /schedule):
  - **Agent 1** (daily 06:00 UTC): searches drone/tech news, scores candidates, updates queue
  - **Agent 2** (every 3 days 07:00 UTC): picks best candidate, writes trilingual post, opens PR
- Branch pattern: `blog/auto-YYYY-MM-DD-<en-slug>`
- PR: draft, labelled `auto-blog`, for human review before merge

## Steps

### Phase 1 — Setup (done once)
1. Create `content/blog/.news-queue.json` with initial structure
2. Register Agent 1 schedule (daily search)
3. Register Agent 2 schedule (article writer)

### Phase 2 — Daily Search Agent logic
1. Run Firecrawl searches across key sources (see Sources section)
2. Score each result 0–10 using scoring rubric
3. Load existing queue, deduplicate by URL
4. Append new candidates, write queue back
5. Commit `.news-queue.json` to main (no PR needed — data file)

### Phase 3 — Article Writer Agent logic
1. Read queue, sort by score, pick first with status=pending
2. Scrape full article text with Firecrawl
3. Generate en.mdx (1500–2500 words, analytical, tech focus, no fluff)
4. Generate lv.mdx (native Latvian from claims map — do NOT translate from EN)
5. Generate ru.mdx (native Russian from claims map — do NOT translate from EN)
6. Generate meta.yml (slugs × 3, titles × 3, excerpts × 3, tags, sourceRef)
7. Generate seo.yml (keywords, seoTitles, socialTeaser × 3)
8. Write files to `content/blog/<en-slug>/`
9. Mark candidate as status=written in queue, commit queue update
10. Create branch `blog/auto-YYYY-MM-DD-<en-slug>`, push, open draft PR

## Sources for search

Primary tech/industrial (daily):
- dronedj.com — general drone news
- suasnews.com — commercial UAV industry
- commercialuavnews.com — enterprise drone
- spectrum.ieee.org — engineering depth
- newatlas.com/tag/drones/
- easa.europa.eu/en/newsroom — EU aviation regulation
- droni.caa.gov.lv / caa.gov.lv — Latvia CAA

General tech with drone filter:
- techcrunch.com + query "drone OR UAV"
- Firecrawl search: "drone technology 2026", "UAV industrial", "autonomous drone"

Latvia / Baltic / EU filter:
- lsm.lv + query "bezpilota"
- Firecrawl search: "drone Latvia", "droni Latvija", "EASA regulation 2026"

## Scoring rubric (0–10)

| Criterion | Points |
|-----------|--------|
| Industrial/tech/commercial focus | +3 |
| EU or Latvia angle | +2 |
| Novel research or product (not repost) | +2 |
| Published within 48h | +2 |
| Strong hook / unique angle | +1 |
| Military-only topic (no commercial angle) | −3 |
| Pure press release / marketing | −2 |

Minimum publishable score: 5

## Risks

- Firecrawl rate limits on daily runs — keep to ≤15 searches per run
- Duplicate detection by URL may miss URL redirects — also deduplicate by title similarity
- Latvian content quality depends on native writing skill, not translation — enforce claims-map approach
- PR auto-approval is NOT configured — human review always required
- Queue file merge conflicts if two agents run simultaneously — not an issue given schedule gap
