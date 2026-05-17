"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";

type Props = {
  placeholder: string;
};

/**
 * Minimal search input. Submits to `/search?q=...`. Pressing `/` anywhere
 * on the page focuses the input (skipped when the user is already typing
 * into another field).
 */
export function SearchInput({ placeholder }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset the value when the user navigates away from /search.
  useEffect(() => {
    if (!pathname.startsWith("/search")) setValue("");
  }, [pathname]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="w-full max-w-xs">
      <label className="sr-only" htmlFor="site-search">
        {placeholder}
      </label>
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-horizon bg-hull/60 px-3 py-1.5 text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/60 focus:outline-none"
      />
    </form>
  );
}
