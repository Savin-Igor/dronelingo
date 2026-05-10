import Image from "next/image";
import type { ReactNode } from "react";

// Visual artefact (diagram, map, comparison matrix). Either a generated image
// (src) or inline children for SVG/JSX content. Always carries a description
// for accessibility — diagrams without text equivalents are not allowed.
export function Artefact({
  src,
  alt,
  description,
  caption,
  children,
}: {
  src?: string;
  alt?: string;
  description: string;
  caption?: string;
  children?: ReactNode;
}) {
  return (
    <figure className="not-prose my-10 border border-horizon bg-hull/40 p-5">
      {src ? (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={src}
            alt={alt ?? description}
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="text-telemetry">{children}</div>
      )}
      {caption ? (
        <figcaption className="mt-3 border-t border-horizon pt-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
          {caption}
        </figcaption>
      ) : null}
      <p className="sr-only">{description}</p>
    </figure>
  );
}
