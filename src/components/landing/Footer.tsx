import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LINKS = ["guide", "blog", "faq", "privacy", "terms"] as const;

const HREF: Record<(typeof LINKS)[number], string> = {
  guide: "/guide",
  blog: "/blog",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
};

export function Footer() {
  const t = useTranslations("landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-horizon bg-hull px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted">
          © {year} DRONELINGO &nbsp;·&nbsp; {t("tagline")}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <li key={link}>
              <Link
                href={HREF[link]}
                className="text-xs text-muted transition-colors hover:text-telemetry"
              >
                {t(link)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
