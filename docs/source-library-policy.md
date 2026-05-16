# Source Library Policy

Status: active engineering policy for the first-party regulations library.

Primary issue: `#76`
Dependent implementation issue: `#75`

This document defines what dronelingo may ingest, mirror, summarize, or only link out to when building the regulations and source library.

## Goals

- keep source pages useful for learners;
- improve internal linking and SEO;
- preserve a clear boundary between internal source capture and public rendering;
- avoid accidental copyright or repo-bloat mistakes;
- give issue `#75` a concrete ruleset for implementation.

## Policy Tiers

### Tier 1 — `full`

Use when first-party rendering of structured source content is acceptable and strategically valuable.

Typical source families:

- EUR-Lex EU regulations and delegated regulations
- selected public Latvian legal texts where reuse is acceptable

Public rendering allowed:

- first-party source pages
- section-level pages or anchors
- normalized article / annex structure
- short summaries and quoted excerpts
- where appropriate, the local rendered text of cited sections

Requirements:

- always link to the official source;
- preserve the official locator, document id, and verification date;
- avoid pretending to replace the legal authority.

### Tier 2 — `summary-only`

Use when the source is official and important, but full mirroring is unnecessary or legally unclear.

Typical source families:

- EASA guidance pages and PDFs
- CAA Latvia pages and operational PDFs
- public training guides used for authoring support

Public rendering allowed:

- source page with structured metadata;
- section summaries;
- short compliant excerpts;
- strong outbound link to the official source.

Public rendering not allowed by default:

- blind full-text mirroring of the whole document.

### Tier 3 — `outbound-only`

Use when local mirroring is low-value, legally unclear, commercially owned, or editorial in nature.

Typical source families:

- vendor docs and brochures
- news coverage
- editorial analysis
- think-tank articles
- commercial product pages

Public rendering allowed:

- title;
- short note or one-line context;
- outbound link;
- relation to lesson, blog post, or source page.

Public rendering not allowed:

- local full-content mirror.

## Internal vs Public Layers

The source library has two different layers.

### Internal source store

Purpose:

- auditability
- editorial traceability
- source change review
- future lexical / semantic indexing

May contain:

- official URL
- fetch date
- verification date
- raw artifact path
- extracted text path
- normalized section map
- checksum or version fingerprint

This layer is not automatically public.

### Public source pages

Purpose:

- user-facing navigation
- SEO landing pages
- source anchors
- backlinks from lessons, questions, and blog posts

May contain:

- localized titles
- summaries
- section labels
- short excerpts
- related content links
- outbound official-source CTA

## Canonical SEO Policy

### Tier 1 pages

- indexable by default;
- dronelingo source pages may be canonical to themselves when the page is sufficiently structured and value-added;
- official source remains prominently linked as the legal authority;
- section anchors should be stable and linkable.

### Tier 2 pages

- indexable by default when the page is an editorial summary with clear structure and related links;
- canonical remains the dronelingo summary page, not the raw third-party PDF mirror;
- do not present the page as if it were the original legal or regulatory text.

### Tier 3 pages

- usually thin reference pages, if created at all;
- may be `noindex` when the page has too little first-party value;
- outbound official or editorial source remains primary.

## Storage Rules

### What belongs in git

- policy documents
- source-family registry
- normalized public source content
- structured metadata
- small supporting text artifacts needed for public rendering

### What may stay under `docs/knowledge/`

Only selected reviewed raw artifacts already used by the content workflow, especially:

- EUR-Lex source PDFs already checked into the repo
- EASA guidance PDFs already checked into the repo
- CAA Latvia pages and PDFs already checked into the repo

### What should not be added broadly to git

- large-scale raw corpus dumps by default
- opportunistic vendor PDF archives
- bulk editorial/news mirrors
- unreviewed third-party document collections

### Future default for larger raw corpora

If the source corpus expands materially, raw artifacts should move out of git into object storage or a separate content bucket, while git retains:

- registry metadata
- normalized structured source content
- references to raw artifact locations

## Search Eligibility

Default policy:

- Tier 1: lexical + semantic eligible
- Tier 2: lexical eligible, semantic optional
- Tier 3: metadata-only, usually no semantic indexing

Search should operate on structured source sections, not raw whole-document blobs.

## Required Metadata For Future Source Entries

Every future source entry should be able to express:

```yml
id: reg-eu-2019-947
family: eur-lex-eu-regulations
kind: regulation
officialUrl: https://eur-lex.europa.eu/...
officialLocator: UAS.OPEN.060(3)
mirroringPolicy: full
licenseStatus: reviewed
publicRendering: allowed
canonicalStrategy: first-party-canonical
searchEligibility: full
contentType: html
fetchedAt: 2026-05-16
lastVerifiedAt: 2026-05-16
rawArtifactPath: docs/knowledge/eu-regulations/EU-2019-947-implementing-regulation-EN.pdf
extractedTextPath: null
sectionId: uas-open-060-3
jurisdiction: eu
```

## Source Family Decision Table

The machine-readable decision table for source families lives in:

- `content/sources/policy.yml`

That file is the registry the implementation should consult. This document defines how to interpret it.

## Implementation Rule For Issue #75

Issue `#75` must treat this document and `content/sources/policy.yml` as the governing ruleset for:

- whether a source becomes a first-party page;
- whether the page is summary-only;
- whether the page may carry local excerpts;
- whether the page should be indexable;
- whether the source is eligible for lexical or semantic search.
