"use client";

import { useEffect, useRef, useState } from "react";
import { NavLinks } from "./NavLinks";
import { LocaleSwitcher } from "./LocaleSwitcher";

function IconMenu() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 4l12 12M16 4L4 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      firstLinkRef.current?.querySelector("a")?.focus();
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-sm p-1.5 text-telemetry transition-colors hover:text-hud-white sm:hidden"
      >
        {open ? <IconClose /> : <IconMenu />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          aria-hidden="true"
          onClick={close}
        />
      )}

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-horizon bg-hull transition-transform duration-200 sm:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-horizon px-6 py-4">
          <span className="font-display text-sm font-semibold tracking-widest text-hud-white">
            MENU
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="rounded-sm p-1.5 text-telemetry transition-colors hover:text-hud-white"
          >
            <IconClose />
          </button>
        </div>

        <nav
          ref={firstLinkRef}
          className="flex flex-col gap-1 px-4 py-6"
          aria-label="Primary"
        >
          <NavLinks onNavigate={close} />
        </nav>

        <div className="mt-auto border-t border-horizon px-6 py-4">
          <LocaleSwitcher />
        </div>
      </div>
    </>
  );
}
