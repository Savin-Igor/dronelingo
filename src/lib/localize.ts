/**
 * Reads a multilingual Json column ({lv, en, ru, ...}) for a given locale.
 * Falls back to `en` per the project i18n contract (CLAUDE.md).
 */
export function localize(value: unknown, locale: string): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    const picked = v[locale] ?? v.en;
    return typeof picked === "string" ? picked : "";
  }
  return "";
}
