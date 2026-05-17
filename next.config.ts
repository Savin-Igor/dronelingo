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
  // @xenova/transformers ships native ONNX Runtime binaries. Bundling it via
  // webpack crashes the build on memory-constrained CI runners (SIGABRT).
  // Exclude from bundling so Node.js loads it via require() at runtime.
  serverExternalPackages: ["@xenova/transformers"],
};

export default withNextIntl(nextConfig);
