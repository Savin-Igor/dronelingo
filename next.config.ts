import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // A package.json exists higher in the host filesystem (~/package.json on the
  // dev machine), which makes Next treat that as the workspace root and pack
  // the whole tree into .next/standalone. Pin tracing to this project.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withNextIntl(nextConfig);
