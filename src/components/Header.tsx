import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileDrawer } from "./MobileDrawer";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./auth/UserMenu";
import { SearchInput } from "./search/SearchInput";

export async function Header() {
  const session = await auth();
  const t = await getTranslations("search");

  return (
    <header className="sticky top-0 z-30 border-b border-horizon bg-cockpit/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-base font-semibold tracking-widest text-hud-white"
        >
          DRONELINGO
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-pulse" aria-hidden />
        </Link>

        <nav
          className="hidden items-center gap-6 sm:flex"
          aria-label="Primary"
        >
          <NavLinks />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchInput placeholder={t("placeholder")} />
          </div>
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <UserMenu user={session?.user ?? null} />
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
