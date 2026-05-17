// MDX → plain text for search indexing.
//
// Strategy: we don't need a full MDX AST for this. The set of custom
// components we use is small and stable, so a regex-driven pass is cheaper
// than dragging in the unified/remark-mdx toolchain.
//
// Two responsibilities:
//   1. extract human-readable text from known JSX components' props
//      (e.g. <MissionBriefing objective="…" />),
//   2. strip the JSX wrappers and JSX expressions so only prose remains.
//
// Unknown components throw — a new lesson component must register here
// before it can ship, otherwise its prose silently vanishes from the index.

/** Components we know how to extract text from. */
const KNOWN_COMPONENTS = new Set([
  "MissionBriefing",
  "CinematicScene",
  "Artefact",
  "Scenario",
  "MemoryAnchor",
  "CommonMistakes",
  "Debrief",
  // Pure interactive widgets — no prose to extract, but registered so the
  // extractor doesn't throw when it sees them.
  "MiniQuiz",
  "ClassComparator",
  "WhCalculator",
  "DistanceRuleSimulator",
  "ZoneClassifier",
  "IMSAFEChecklist",
]);

/** Text-bearing prop names per component (in order they appear in output). */
const TEXT_PROPS: Record<string, string[]> = {
  MissionBriefing: ["objective"],
  CinematicScene: ["caption"], // skip `prompt` (image gen) and `alt`
  Artefact: ["description", "caption"],
  Scenario: ["title"],
  MemoryAnchor: ["rule", "hint"],
  CommonMistakes: [],
  Debrief: [],
};

/** Components whose children we keep as prose. */
const COMPONENTS_WITH_PROSE_CHILDREN = new Set([
  "MissionBriefing",
  "Artefact",
  "Scenario",
  "CommonMistakes",
  "Debrief",
]);

/** Components we drop entirely (interactive widgets, embedded quizzes). */
const DROPPED_COMPONENTS = new Set([
  "MiniQuiz",
  "ClassComparator",
  "WhCalculator",
  "DistanceRuleSimulator",
  "ZoneClassifier",
  "IMSAFEChecklist",
]);

/**
 * Extract the value of a string prop from a JSX opening tag.
 * Handles `prop="value"` only — JSX expressions like `prop={…}` are skipped.
 */
function extractStringProp(tagText: string, propName: string): string | null {
  // Match prop="..." with non-greedy capture; allow newlines inside the
  // attribute value because lesson authors sometimes wrap long objectives.
  const re = new RegExp(
    `\\b${propName}\\s*=\\s*"([^"]*?)"`,
    "s",
  );
  const m = tagText.match(re);
  return m ? m[1] : null;
}

/**
 * Quick check that a component is registered. Caller passes the bare name
 * (e.g. "MissionBriefing"), not the tag.
 */
function assertKnown(name: string): void {
  if (!KNOWN_COMPONENTS.has(name)) {
    throw new Error(
      `mdx-to-text: unknown JSX component <${name}>. ` +
        `Register it in KNOWN_COMPONENTS before adding to lesson content.`,
    );
  }
}

/**
 * Strip JSX expressions like `{[...].map(...)}`. We bracket-match so nested
 * braces inside expressions don't confuse a naive `{[^}]*}` regex.
 */
function stripJsxExpressions(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "{" && s[i - 1] !== "\\") {
      // Find matching close brace.
      let depth = 1;
      let j = i + 1;
      while (j < s.length && depth > 0) {
        if (s[j] === "{") depth++;
        else if (s[j] === "}") depth--;
        if (depth === 0) break;
        j++;
      }
      if (depth === 0) {
        // Skip the whole expression.
        i = j + 1;
        continue;
      }
    }
    out += s[i];
    i++;
  }
  return out;
}

/**
 * Find the index just AFTER the closing `>` of a JSX opening or self-closing
 * tag that starts at `tagStart`. Attribute-aware: `>` inside `"…"`, `'…'`,
 * or `{…}` is ignored.
 *
 * Returns { end, selfClose, attrsRaw }.
 */
function readOpeningTag(
  src: string,
  tagStart: number,
  nameLength: number,
): { end: number; selfClose: boolean; attrsRaw: string } {
  let i = tagStart + 1 + nameLength; // after "<Name"
  let inString: "\"" | "'" | null = null;
  let braceDepth = 0;
  while (i < src.length) {
    const ch = src[i];
    if (inString) {
      if (ch === inString && src[i - 1] !== "\\") inString = null;
      i++;
      continue;
    }
    if (braceDepth > 0) {
      if (ch === "{") braceDepth++;
      else if (ch === "}") braceDepth--;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "{") {
      braceDepth++;
      i++;
      continue;
    }
    if (ch === ">") {
      const selfClose = src[i - 1] === "/";
      const attrsEnd = selfClose ? i - 1 : i;
      const attrsRaw = src.slice(tagStart + 1 + nameLength, attrsEnd);
      return { end: i + 1, selfClose, attrsRaw };
    }
    i++;
  }
  throw new Error(
    `mdx-to-text: unterminated opening tag starting at index ${tagStart}`,
  );
}

/**
 * Process every JSX block in the source, replacing each with its extracted
 * text (prop values + cleaned children for known wrappers, empty string for
 * dropped widgets).
 */
function processJsxBlocks(src: string): string {
  // Walk the source looking for `<Name`. Component names are capitalised —
  // lowercase HTML tags are left alone here and stripped later.
  const nameRe = /<([A-Z][A-Za-z0-9]*)\b/g;
  let out = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = nameRe.exec(src))) {
    const tagStart = match.index;
    if (tagStart < cursor) continue; // already consumed by a previous block
    const name = match[1];
    assertKnown(name);
    out += src.slice(cursor, tagStart);

    const { end: openEnd, selfClose, attrsRaw } = readOpeningTag(
      src,
      tagStart,
      name.length,
    );

    if (DROPPED_COMPONENTS.has(name)) {
      if (selfClose) {
        cursor = openEnd;
        nameRe.lastIndex = cursor;
        continue;
      }
      const close = src.indexOf(`</${name}>`, openEnd);
      cursor = close >= 0 ? close + `</${name}>`.length : openEnd;
      nameRe.lastIndex = cursor;
      continue;
    }

    // Known wrapper: extract text props.
    const propTexts: string[] = [];
    for (const prop of TEXT_PROPS[name] ?? []) {
      const val = extractStringProp(attrsRaw, prop);
      if (val) propTexts.push(val);
    }

    if (selfClose) {
      out += propTexts.join("\n\n") + "\n\n";
      cursor = openEnd;
      nameRe.lastIndex = cursor;
      continue;
    }

    // Block wrapper — find matching close. Closing tags don't contain
    // attributes so a plain indexOf is safe.
    const closeStr = `</${name}>`;
    const closeAt = src.indexOf(closeStr, openEnd);
    if (closeAt < 0) {
      throw new Error(
        `mdx-to-text: unterminated <${name}> opened at index ${tagStart}`,
      );
    }
    const childrenRaw = src.slice(openEnd, closeAt);
    out += propTexts.join("\n\n");
    if (propTexts.length > 0) out += "\n\n";
    if (COMPONENTS_WITH_PROSE_CHILDREN.has(name)) {
      out += processJsxBlocks(childrenRaw);
    }
    out += "\n\n";

    cursor = closeAt + closeStr.length;
    nameRe.lastIndex = cursor;
  }
  out += src.slice(cursor);
  return out;
}

/**
 * Strip markdown emphasis/links/code/images but preserve heading lines and
 * paragraph breaks. Embeddings work fine on lightly-formatted text and the
 * lexical FTS doesn't care, so we keep this conservative.
 */
function stripMarkdownNoise(s: string): string {
  return s
    // Images: ![alt](url) → alt (alt text is human-readable, url is not).
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Links: [text](url) → text.
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Inline code: `x` → x (no marker — we don't want to embed backticks).
    .replace(/`([^`]+)`/g, "$1")
    // Bold/italic markers (preserve word content).
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    // HTML comments.
    .replace(/<!--[\s\S]*?-->/g, "");
}

function collapseBlankLines(s: string): string {
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Strip lowercase HTML tags that survive JSX processing (Artefact and other
 * components sometimes wrap children in <div className="…">, <span>, etc.).
 * Self-closing tags and entities are handled too.
 */
function stripHtmlTags(s: string): string {
  return s
    .replace(/<\/?[a-z][a-zA-Z0-9-]*(\s[^>]*)?>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/**
 * Convert MDX source to plain text suitable for indexing.
 *
 * The output preserves `#` heading lines so the chunker can split on them,
 * preserves paragraph breaks, and drops everything else.
 */
export function mdxToText(src: string): string {
  let text = src;

  // 1. Remove front-matter-style YAML fences if present (we don't use them
  // in lesson MDX, but be defensive).
  text = text.replace(/^---\n[\s\S]*?\n---\n/, "");

  // 2. Process JSX blocks (props + children).
  text = processJsxBlocks(text);

  // 3. Strip any remaining JSX expressions like `{[...].map(...)}`.
  text = stripJsxExpressions(text);

  // 4. Strip lowercase HTML tags that survive JSX processing.
  text = stripHtmlTags(text);

  // 5. Strip markdown noise.
  text = stripMarkdownNoise(text);

  // 6. Collapse blank lines.
  text = collapseBlankLines(text);

  return text;
}
