import { Link } from "@/i18n/navigation";
import { parseSourceRef, getInternalUrl } from "@/lib/source-citations";

type Props = {
  sourceRef: string;
  label?: string;
  className?: string;
};

export function SourceCitationList({ sourceRef, label, className }: Props) {
  const citations = parseSourceRef(sourceRef);
  if (citations.length === 0) return null;

  return (
    <div className={className}>
      {label ? <span>{label} </span> : null}
      {citations.map((citation, index) => {
        const internalUrl = getInternalUrl(citation.url);
        return (
          <span key={`${citation.label}-${index}`}>
            {index > 0 ? <span>; </span> : null}
            {internalUrl ? (
              <span>
                <Link
                  href={internalUrl}
                  className="underline decoration-horizon underline-offset-2 transition-colors hover:text-hud-white hover:decoration-cyan-pulse"
                >
                  {citation.label}
                </Link>
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener nofollow noreferrer"
                    className="ml-1 text-muted transition-colors hover:text-telemetry"
                    title="Official source"
                  >
                    ↗
                  </a>
                )}
              </span>
            ) : citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener nofollow noreferrer"
                className="underline decoration-horizon underline-offset-2 transition-colors hover:text-hud-white hover:decoration-cyan-pulse"
              >
                {citation.label}
              </a>
            ) : (
              <span>{citation.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
