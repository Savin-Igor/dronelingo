import { Link } from "@/i18n/navigation";
import { SourceCitationList } from "@/components/content/SourceCitationList";
import type { BlogPostMeta } from "@/lib/blog";

type Props = {
  post: BlogPostMeta;
  /** Translation map for footer copy — keyed by `blog.footer.*`. */
  copy: {
    sourceLabel: string;
    backToBlog: string;
    ctaHeading: string;
    ctaBody: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export function BlogPostFooter({ post, copy }: Props) {
  return (
    <footer className="mt-12 space-y-6">
      {post.sourceRef && (
        <div className="rounded-sm border border-horizon bg-hull/30 p-4 font-mono text-xs text-muted">
          <span className="uppercase tracking-widest text-cyan-pulse">
            {copy.sourceLabel}
          </span>
          <SourceCitationList
            sourceRef={post.sourceRef}
            className="mt-2 break-words text-telemetry"
          />
        </div>
      )}

      <section className="rounded-sm border border-cyan-pulse/30 bg-cockpit p-6">
        <h2 className="font-display text-xl font-semibold text-hud-white">
          {copy.ctaHeading}
        </h2>
        <p className="mt-2 text-sm text-telemetry">{copy.ctaBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/learn/air-safety"
            className="plausible-event-name=Blog+CTA+Learn inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {copy.ctaPrimary} →
          </Link>
          <Link
            href="/exam"
            className="plausible-event-name=Blog+CTA+Exam inline-flex items-center justify-center rounded-sm border border-horizon px-4 py-2 text-sm font-medium text-telemetry transition-colors hover:border-cyan-pulse/40 hover:text-hud-white"
          >
            {copy.ctaSecondary}
          </Link>
        </div>
      </section>

      <div>
        <Link
          href="/blog"
          className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
        >
          ← {copy.backToBlog}
        </Link>
      </div>
    </footer>
  );
}
