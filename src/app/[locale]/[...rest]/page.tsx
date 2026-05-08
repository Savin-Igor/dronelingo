import { notFound } from "next/navigation";

/**
 * Catch-all under [locale] so any unmatched URL path beneath a valid
 * locale (e.g. /lv/nonexistent) triggers the localised
 * [locale]/not-found.tsx instead of the generic root-level 404.
 */
export default function CatchAll(): never {
  notFound();
}
