import { auth } from "@/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const intl = createIntlMiddleware(routing);

export default auth((req: NextRequest & { auth: unknown }) => {
  return intl(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
