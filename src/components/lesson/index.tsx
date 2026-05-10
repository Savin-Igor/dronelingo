import type { MDXComponents } from "mdx/types";

// Custom MDX component map for lesson pages.
// Extend this with visual elements: diagrams, callouts, infographics, etc.
export const lessonComponents: MDXComponents = {
  // Regulatory callout — wraps important rule references
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 border-l-2 border-cyan-pulse bg-cyan-pulse/5 px-4 py-3 text-sm">
      {children}
    </div>
  ),

  // Key fact highlight
  KeyFact: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 rounded-sm border border-amber-alert/30 bg-amber-alert/5 px-4 py-3 text-sm text-amber-alert">
      {children}
    </div>
  ),

  // Warning / danger note
  Warning: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 border-l-2 border-red-danger bg-red-danger/5 px-4 py-3 text-sm text-red-danger">
      {children}
    </div>
  ),
};
