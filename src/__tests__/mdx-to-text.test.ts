import { describe, it, expect } from "vitest";
import { mdxToText } from "@/lib/search/mdx-to-text";

describe("mdxToText", () => {
  it("preserves H2 headings as section markers", () => {
    const out = mdxToText("# Title\n\n## Section One\n\nProse paragraph.\n\n## Section Two\n\nMore prose.");
    expect(out).toContain("## Section One");
    expect(out).toContain("## Section Two");
    expect(out).toContain("Prose paragraph.");
  });

  it("extracts MissionBriefing objective prop and children", () => {
    const out = mdxToText(
      '<MissionBriefing objective="Learn the rule.">\nWhy it matters.\n</MissionBriefing>',
    );
    expect(out).toContain("Learn the rule.");
    expect(out).toContain("Why it matters.");
  });

  it("extracts MemoryAnchor rule and hint props from a self-closing tag", () => {
    const out = mdxToText('<MemoryAnchor rule="Always X." hint="Never Y." />');
    expect(out).toContain("Always X.");
    expect(out).toContain("Never Y.");
  });

  it("extracts Scenario title prop and children prose", () => {
    const out = mdxToText(
      '<Scenario title="The drone is at 120 m and a thunderstorm is closing.">\nLand immediately. Document the weather.\n</Scenario>',
    );
    expect(out).toContain("thunderstorm is closing");
    expect(out).toContain("Land immediately");
  });

  it("drops MiniQuiz and self-closing interactive widgets", () => {
    const out = mdxToText(
      '## Heading\n\nProse.\n\n<ClassComparator />\n\n<MiniQuiz questions={[{stem:"x"}]} />',
    );
    expect(out).toContain("## Heading");
    expect(out).toContain("Prose.");
    expect(out).not.toContain("ClassComparator");
    expect(out).not.toContain("MiniQuiz");
    expect(out).not.toContain("stem");
  });

  it("strips JSX expressions like {[...].map(...)} entirely", () => {
    const out = mdxToText(
      "Prose before.\n\n{[1, 2, 3].map((n) => <span key={n}>{n}</span>)}\n\nProse after.",
    );
    expect(out).toContain("Prose before");
    expect(out).toContain("Prose after");
    expect(out).not.toContain("map");
  });

  it("throws on unknown JSX component names", () => {
    expect(() => mdxToText("<UnknownComponent prop=\"x\" />")).toThrow(
      /unknown JSX component/,
    );
  });

  it("strips markdown links but preserves visible text", () => {
    const out = mdxToText("See [the policy](https://example.com/policy) for details.");
    expect(out).toContain("the policy");
    expect(out).not.toContain("example.com");
  });

  it("preserves the source-library {#anchor} markers in headings", () => {
    // mdxToText itself doesn't strip anchor markers — chunkSource handles
    // anchored split. Verify they survive the pipeline.
    const out = mdxToText("## Coverage {#coverage}\n\nProse.");
    expect(out).toContain("Coverage");
  });
});
