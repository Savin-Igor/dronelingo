# Source SEO Strategy

Status: active engineering strategy for `/regulations` and future `/regulations/[source]` pages.

Primary issue: `#76`
Dependent implementation issue: `#75`

This document defines how source pages should behave for indexing, canonicals, and internal linking.

## SEO Intent

Source pages exist to do three jobs at once:

- keep the learner inside dronelingo when they follow a citation;
- create a strong internal linking layer between source material and academy content;
- earn search visibility for regulatory and operational queries without pretending to be the official source.

## Canonical Rules

### Tier 1 — `full`

Use a self-canonical dronelingo page when:

- the page is structured;
- the page adds sectioning, summaries, internal anchors, and related content;
- the page is not a raw mirror dump.

Always include:

- official source link;
- official document title;
- official locator or document id where relevant.

### Tier 2 — `summary-only`

Use a self-canonical dronelingo page when:

- the page is an original summary;
- the page contains editorial explanation and related links;
- excerpts remain limited and supportive.

Do not publish a raw mirrored PDF page as an indexable canonical substitute.

### Tier 3 — `outbound-only`

Default options:

- no dedicated page; or
- thin contextual page with `noindex` if it exists only as a reference shell.

## Indexability Defaults

### Indexable by default

- `/[locale]/regulations`
- `/[locale]/regulations/[source]` for Tier 1 and Tier 2 pages

### Consider `noindex`

- low-value Tier 3 source shells
- duplicate locale stubs with missing content
- any page that is effectively only an outbound link list with no first-party value

## Anchor Strategy

Source pages should expose stable anchors for:

- articles
- annexes
- sections
- operational subtopics

Anchor ids should be:

- stable over time
- human-readable
- derived from structured section ids where possible

Example:

- `/en/regulations/reg-eu-2019-947#uas-open-060-3`

## Internal Linking Rules

Each source page should link to:

- related lessons
- related questions
- related blog posts

Each lesson/question/blog citation should prefer:

- internal source-page anchor first;
- outbound official source second.

## Snippet Strategy

Search-facing snippets should prefer:

- original dronelingo summaries;
- short compliant excerpts only when useful;
- exact official locator labels for legal precision.

Avoid:

- long copied blocks from third-party materials;
- thin pages that only restate the source title.

## Structured Data Direction

When source pages are implemented, prefer structured metadata that can support:

- localized title
- official source URL
- last verified date
- jurisdiction
- source family
- document type
- section count
- related content count

## Relationship To Search

Source SEO and source search should share the same content model.

That means:

- the source section used for indexing should also be the section used for anchors;
- the summary used for the source page should also be eligible for lexical and semantic retrieval where policy allows;
- source-family policy from `content/sources/policy.yml` governs search eligibility.
