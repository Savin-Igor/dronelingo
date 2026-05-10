"use client";

import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
