import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { cache } from "react";
import { parse as parseYaml } from "yaml";

const SOURCES_DIR = resolve(process.cwd(), "content/sources");

export type SourceKind = "eu-regulation" | "easa-guidance" | "caa-operational";

export type SourceMeta = {
  id: string;
  kind: SourceKind;
  officialTitle: Record<string, string>;
  shortTitle: Record<string, string>;
  canonicalUrl: string;
  lastVerifiedAt: string;
};

type RawSourceMeta = {
  id: string;
  kind: SourceKind;
  officialTitle: Record<string, string>;
  shortTitle: Record<string, string>;
  canonicalUrl: string;
  lastVerifiedAt: string;
};

function readMeta(id: string): SourceMeta | null {
  const metaPath = join(SOURCES_DIR, id, "meta.yml");
  if (!existsSync(metaPath)) return null;
  const raw = parseYaml(readFileSync(metaPath, "utf-8")) as RawSourceMeta;
  return {
    id: raw.id,
    kind: raw.kind,
    officialTitle: raw.officialTitle,
    shortTitle: raw.shortTitle,
    canonicalUrl: raw.canonicalUrl,
    lastVerifiedAt: raw.lastVerifiedAt,
  };
}

export const listAllSources = cache((): SourceMeta[] => {
  if (!existsSync(SOURCES_DIR)) return [];
  const dirs = readdirSync(SOURCES_DIR).filter((entry) => {
    const full = join(SOURCES_DIR, entry);
    return statSync(full).isDirectory();
  });
  const sources: SourceMeta[] = [];
  for (const dir of dirs) {
    const meta = readMeta(dir);
    if (meta) sources.push(meta);
  }
  return sources;
});

export function getSource(id: string): SourceMeta | null {
  return readMeta(id);
}

export function getSourceBody(id: string, locale: string): string | null {
  const candidate = join(SOURCES_DIR, id, `${locale}.mdx`);
  if (existsSync(candidate)) return readFileSync(candidate, "utf-8");
  const fallback = join(SOURCES_DIR, id, "en.mdx");
  if (existsSync(fallback)) return readFileSync(fallback, "utf-8");
  return null;
}
