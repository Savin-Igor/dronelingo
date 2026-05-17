import GithubSlugger from "github-slugger";

/**
 * Slugify a heading text the same way `rehype-slug` does at render time.
 * Round-tripping is what lets a search result URL anchor scroll to the
 * matching heading on the rendered page.
 *
 * Use a fresh slugger per file so two files with identical headings still
 * produce identical anchors. Within one file, pass the same slugger instance
 * across all headings — that way duplicates within a file are disambiguated
 * (`section`, `section-1`, `section-2`) in both the indexer and at render
 * time.
 */
export function newSlugger(): GithubSlugger {
  return new GithubSlugger();
}

export function slugifyHeading(slugger: GithubSlugger, text: string): string {
  return slugger.slug(text);
}
