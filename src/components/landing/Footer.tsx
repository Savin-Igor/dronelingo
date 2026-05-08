import { useTranslations } from "next-intl";

const LINKS = ["guide", "faq", "privacy", "terms"] as const;

export function Footer() {
  const t = useTranslations("landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          © {year} dronelingo · {t("tagline")}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          {LINKS.map((link) => (
            <li key={link}>
              <a href="#" className="hover:text-gray-900">
                {t(link)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
