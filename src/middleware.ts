import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Edge-safe: uses authConfig (no nodemailer, no prisma)
const { auth } = NextAuth(authConfig);
const intl = createIntlMiddleware(routing);

export default auth((req) => {
  return intl(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
