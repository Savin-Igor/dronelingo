import { describe, it, expect } from "vitest";
import {
  chunkLesson,
  chunkQuestion,
  chunkBlog,
  chunkSource,
  chunkStatic,
} from "@/lib/search/chunk";

describe("chunkLesson", () => {
  it("produces one chunk per H2 section with slugified anchors", () => {
    const chunks = chunkLesson({
      locale: "lv",
      topicSlug: "air-safety",
      lessonSlug: "vlos",
      lessonTitle: "VLOS",
      mdx: "# Title\n\n## Pirmā sadaļa\n\nProse one.\n\n## Otrā sadaļa\n\nProse two.",
    });
    expect(chunks).toHaveLength(2);
    expect(chunks[0].anchor).toBe("pirmā-sadaļa");
    expect(chunks[0].url).toBe("/lv/learn/air-safety/vlos#pirmā-sadaļa");
    expect(chunks[0].title).toBe("VLOS · Pirmā sadaļa");
    expect(chunks[0].contentId).toBe("air-safety/vlos");
    expect(chunks[1].anchor).toBe("otrā-sadaļa");
  });

  it("drops top-of-file preamble before the first H2", () => {
    const chunks = chunkLesson({
      locale: "en",
      topicSlug: "air-safety",
      lessonSlug: "vlos",
      lessonTitle: "VLOS",
      mdx: "# Title\n\nLead paragraph.\n\n## First Section\n\nReal prose.",
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].body).toContain("Real prose.");
    expect(chunks[0].body).not.toContain("Lead paragraph.");
  });
});

describe("chunkQuestion", () => {
  it("produces one chunk per question per locale", () => {
    const chunks = chunkQuestion({
      externalId: "as-001",
      locale: "lv",
      stem: "Kas ir VLOS?",
      correctOptionText: "Visual line of sight.",
      explanation: "VLOS nozīmē, ka pilots tieši redz dronu.",
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].contentType).toBe("question");
    expect(chunks[0].anchor).toBe("");
    expect(chunks[0].url).toBe("/lv/practice?qid=as-001");
    expect(chunks[0].body).toContain("Kas ir VLOS?");
    expect(chunks[0].body).toContain("Visual line of sight.");
    expect(chunks[0].body).toContain("tieši redz dronu");
  });

  it("truncates the title to 80 chars for long stems", () => {
    const longStem = "x".repeat(120);
    const chunks = chunkQuestion({
      externalId: "as-002",
      locale: "en",
      stem: longStem,
      correctOptionText: "yes",
      explanation: "because",
    });
    expect(chunks[0].title.length).toBeLessThanOrEqual(80);
    expect(chunks[0].title.endsWith("…")).toBe(true);
  });
});

describe("chunkBlog", () => {
  it("uses the localised slug in the URL", () => {
    const chunks = chunkBlog({
      locale: "ru",
      dirSlug: "military-drone-trends-dominate-2026",
      localisedSlug: "voennye-dronovye-trendy-kotorye-opredelyat-2026-god",
      title: "Военные дроны",
      mdx: "## Раздел один\n\nТекст.",
    });
    expect(chunks[0].url).toBe(
      "/ru/blog/voennye-dronovye-trendy-kotorye-opredelyat-2026-god#раздел-один",
    );
    expect(chunks[0].contentId).toBe("military-drone-trends-dominate-2026");
  });
});

describe("chunkSource", () => {
  it("splits on explicit {#anchor} markers and preserves them", () => {
    const mdx = [
      "# Insurance",
      "",
      "## Minimum coverage {#coverage}",
      "",
      "EU minimum is 750k SDR.",
      "",
      "## Exclusions {#exclusions}",
      "",
      "War risks excluded.",
    ].join("\n");
    const chunks = chunkSource({
      locale: "en",
      sourceId: "caa-lv-insurance",
      sourceTitle: "CAA Latvia · Insurance",
      mdx,
    });
    expect(chunks).toHaveLength(2);
    expect(chunks[0].anchor).toBe("coverage");
    expect(chunks[0].url).toBe("/en/regulations/caa-lv-insurance#coverage");
    expect(chunks[0].body).toContain("750k SDR");
    expect(chunks[1].anchor).toBe("exclusions");
    expect(chunks[1].body).toContain("War risks excluded.");
  });

  it("falls back to no anchor when a heading lacks {#id}", () => {
    const chunks = chunkSource({
      locale: "en",
      sourceId: "caa-lv-insurance",
      sourceTitle: "CAA Latvia · Insurance",
      mdx: "## Plain heading\n\nProse.",
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].anchor).toBe("");
    expect(chunks[0].url).toBe("/en/regulations/caa-lv-insurance");
  });
});

describe("chunkStatic", () => {
  it("produces one chunk per H2 with type prefix in the title", () => {
    const chunks = chunkStatic({
      locale: "lv",
      pageType: "faq",
      mdx: "## Cik maksā?\n\n19 EUR.\n\n## Cik ilgi der?\n\n5 gadi.",
    });
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("Faq · Cik maksā?");
    expect(chunks[0].url).toBe("/lv/faq#cik-maksā");
  });
});
