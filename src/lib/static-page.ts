import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "content/static");

/**
 * Read a localised MDX file from `content/static/<page>/<locale>.mdx`.
 * Falls back to `en` when the requested locale is missing.
 *
 * Returns null if neither the requested locale nor `en` exists, so the
 * caller can render a 404.
 */
export function readStaticPage(
  page: string,
  locale: string,
): string | null {
  const candidate = join(ROOT, page, `${locale}.mdx`);
  if (existsSync(candidate)) {
    return readFileSync(candidate, "utf-8");
  }
  const fallback = join(ROOT, page, "en.mdx");
  if (existsSync(fallback)) {
    return readFileSync(fallback, "utf-8");
  }
  return null;
}
