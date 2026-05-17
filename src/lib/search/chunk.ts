// Per-content-type chunkers for the search index.
//
// All chunkers produce SearchChunkInput records — the shape the indexer
// writes to the SearchChunk table. The contentType field is the only thing
// the retrieval layer uses to apply per-type boosts.

import { mdxToText } from "./mdx-to-text";
import { newSlugger, slugifyHeading } from "./slug";

export type ContentType = "lesson" | "question" | "blog" | "source" | "static";

export type SearchChunkInput = {
  contentType: ContentType;
  contentId: string;
  locale: string;
  /** Slugified heading anchor; empty string "" for anchor-less chunks. */
  anchor: string;
  url: string;
  title: string;
  body: string;
};

/** Approximate character budget per chunk. Tokens are ~3.5 chars on
 * average across our three locales; a 3200-char cap keeps each chunk
 * comfortably under ~1000 tokens for the e5-small encoder (max 512 input
 * tokens — we send the first 512 worth of tokens via the tokenizer). */
const MAX_CHUNK_CHARS = 3200;

/**
 * Split a `#`/`##`-headed document into (heading, body) sections.
 * Top-of-file prose before the first `##` is dropped — lesson MDX usually
 * starts with `# Lesson title` which we get from meta.yml instead.
 */
type Section = { heading: string | null; body: string };

function splitByH2(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let current: Section = { heading: null, body: "" };
  for (const line of lines) {
    const h2 = /^##\s+(.+?)\s*(\{#[a-z0-9-]+\})?\s*$/.exec(line);
    if (h2) {
      if (current.heading || current.body.trim()) sections.push(current);
      current = { heading: h2[1].trim(), body: "" };
    } else {
      current.body += line + "\n";
    }
  }
  if (current.heading || current.body.trim()) sections.push(current);
  return sections;
}

/**
 * Split oversized bodies on paragraph boundaries with one-paragraph
 * overlap. We keep the heading the same across the resulting chunks; the
 * unique constraint disambiguates with the anchor — for splits, we suffix
 * the anchor with `-pN`.
 */
function paragraphChunks(body: string, maxChars: number): string[] {
  if (body.length <= maxChars) return [body.trim()];
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  let overlap = "";
  for (const p of paragraphs) {
    const next = cur ? cur + "\n\n" + p : p;
    if (next.length > maxChars && cur) {
      out.push(cur);
      cur = (overlap ? overlap + "\n\n" : "") + p;
    } else {
      cur = next;
    }
    overlap = p;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

// ----------------------------------------------------------------------
// Lessons
// ----------------------------------------------------------------------

export type LessonChunkInput = {
  locale: string;
  topicSlug: string;
  lessonSlug: string;
  lessonTitle: string; // already locale-resolved
  mdx: string;
};

export function chunkLesson(input: LessonChunkInput): SearchChunkInput[] {
  const text = mdxToText(input.mdx);
  const sections = splitByH2(text).filter((s) => s.heading); // drop preamble
  const slugger = newSlugger();
  const out: SearchChunkInput[] = [];
  const baseUrl = `/${input.locale}/learn/${input.topicSlug}/${input.lessonSlug}`;
  const contentId = `${input.topicSlug}/${input.lessonSlug}`;

  for (const section of sections) {
    const heading = section.heading!;
    const anchor = slugifyHeading(slugger, heading);
    const body = section.body.trim();
    if (!body) continue;
    const parts = paragraphChunks(body, MAX_CHUNK_CHARS);
    parts.forEach((part, i) => {
      out.push({
        contentType: "lesson",
        contentId,
        locale: input.locale,
        anchor: parts.length === 1 ? anchor : `${anchor}-p${i + 1}`,
        url: `${baseUrl}#${anchor}`,
        title: `${input.lessonTitle} · ${heading}`,
        body: part,
      });
    });
  }
  return out;
}

// ----------------------------------------------------------------------
// Questions
// ----------------------------------------------------------------------

export type QuestionChunkInput = {
  externalId: string;
  locale: string;
  stem: string;
  correctOptionText: string;
  explanation: string;
};

export function chunkQuestion(input: QuestionChunkInput): SearchChunkInput[] {
  const body = [
    input.stem.trim(),
    input.correctOptionText.trim(),
    input.explanation.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
  if (!body) return [];
  const titleSrc = input.stem.trim();
  const title = titleSrc.length > 80 ? titleSrc.slice(0, 77) + "…" : titleSrc;
  return [
    {
      contentType: "question",
      contentId: input.externalId,
      locale: input.locale,
      anchor: "",
      url: `/${input.locale}/practice?qid=${input.externalId}`,
      title,
      body,
    },
  ];
}

// ----------------------------------------------------------------------
// Blog
// ----------------------------------------------------------------------

export type BlogChunkInput = {
  locale: string;
  dirSlug: string; // canonical directory name (used as contentId)
  localisedSlug: string; // slug for the URL in this locale
  title: string;
  mdx: string;
};

export function chunkBlog(input: BlogChunkInput): SearchChunkInput[] {
  const text = mdxToText(input.mdx);
  const sections = splitByH2(text).filter((s) => s.heading);
  const slugger = newSlugger();
  const out: SearchChunkInput[] = [];
  const baseUrl = `/${input.locale}/blog/${input.localisedSlug}`;

  for (const section of sections) {
    const heading = section.heading!;
    const anchor = slugifyHeading(slugger, heading);
    const body = section.body.trim();
    if (!body) continue;
    const parts = paragraphChunks(body, MAX_CHUNK_CHARS);
    parts.forEach((part, i) => {
      out.push({
        contentType: "blog",
        contentId: input.dirSlug,
        locale: input.locale,
        anchor: parts.length === 1 ? anchor : `${anchor}-p${i + 1}`,
        url: `${baseUrl}#${anchor}`,
        title: `${input.title} · ${heading}`,
        body: part,
      });
    });
  }
  return out;
}

// ----------------------------------------------------------------------
// Source library
// ----------------------------------------------------------------------

/**
 * Sources use explicit `## Heading {#anchor-id}` markers — split on those
 * verbatim. Authors control the anchor; we do not re-slugify.
 */
export type SourceChunkInput = {
  locale: string;
  sourceId: string;
  sourceTitle: string;
  mdx: string;
};

export function chunkSource(input: SourceChunkInput): SearchChunkInput[] {
  // Don't run mdxToText on sources — they're plain markdown (no JSX), and
  // we need the explicit `{#anchor}` markers preserved.
  const text = input.mdx;
  const out: SearchChunkInput[] = [];
  const baseUrl = `/${input.locale}/regulations/${input.sourceId}`;
  const lines = text.split("\n");
  let currentHeading: string | null = null;
  let currentAnchor = "";
  let buffer = "";

  const flush = () => {
    if (!currentHeading || !buffer.trim()) return;
    out.push({
      contentType: "source",
      contentId: input.sourceId,
      locale: input.locale,
      anchor: currentAnchor,
      url: currentAnchor ? `${baseUrl}#${currentAnchor}` : baseUrl,
      title: `${input.sourceTitle} · ${currentHeading}`,
      body: buffer.trim(),
    });
    buffer = "";
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?\s*$/.exec(line);
    if (h2) {
      flush();
      currentHeading = h2[1].trim();
      currentAnchor = h2[2] ?? "";
      continue;
    }
    if (currentHeading) buffer += line + "\n";
  }
  flush();
  return out;
}

// ----------------------------------------------------------------------
// Static pages (faq, guide, privacy, terms, regulations)
// ----------------------------------------------------------------------

export type StaticChunkInput = {
  locale: string;
  pageType: string; // "faq" | "guide" | "privacy" | "terms" | "regulations"
  mdx: string;
};

export function chunkStatic(input: StaticChunkInput): SearchChunkInput[] {
  const text = mdxToText(input.mdx);
  const sections = splitByH2(text).filter((s) => s.heading);
  const slugger = newSlugger();
  const out: SearchChunkInput[] = [];
  const baseUrl = `/${input.locale}/${input.pageType}`;

  for (const section of sections) {
    const heading = section.heading!;
    const anchor = slugifyHeading(slugger, heading);
    const body = section.body.trim();
    if (!body) continue;
    const parts = paragraphChunks(body, MAX_CHUNK_CHARS);
    parts.forEach((part, i) => {
      out.push({
        contentType: "static",
        contentId: input.pageType,
        locale: input.locale,
        anchor: parts.length === 1 ? anchor : `${anchor}-p${i + 1}`,
        url: `${baseUrl}#${anchor}`,
        title: `${capitalise(input.pageType)} · ${heading}`,
        body: part,
      });
    });
  }
  return out;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
