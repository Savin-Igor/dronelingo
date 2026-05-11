import Image from "next/image";
import { useTranslations } from "next-intl";

// Cinematic hero / scene block. If `src` is provided, renders the image with
// a HUD-style bottom gradient + caption strip. If `src` is omitted, renders a
// tactical placeholder showing the generation prompt — useful while a wave's
// Nano Banana assets are still being produced.
export function CinematicScene({
  src,
  alt,
  caption,
  prompt,
}: {
  src?: string;
  alt: string;
  caption?: string;
  prompt?: string;
}) {
  return (
    <figure className="not-prose my-10 overflow-hidden border border-horizon bg-hull">
      <div className="relative aspect-[16/9] w-full">
        {src ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
              priority={false}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hull/80 via-transparent to-transparent"
            />
          </>
        ) : (
          <ScenePlaceholder alt={alt} prompt={prompt} />
        )}
      </div>
      {caption ? (
        <figcaption className="border-t border-horizon px-4 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ScenePlaceholder({ alt, prompt }: { alt: string; prompt?: string }) {
  const t = useTranslations("lessonWidgets.anatomy");
  return (
    <div
      aria-label={alt}
      role="img"
      className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.08),transparent_60%)] p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(36,51,87,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(36,51,87,0.4) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        ◇ {t("scenePlaceholder")}
      </p>
      <div className="max-w-prose">
        <p className="font-mono text-xs text-telemetry">{alt}</p>
        {prompt ? (
          <p className="mt-2 font-mono text-[0.65rem] text-muted">
            <span className="text-cyan-pulse/70">{t("promptLabel")} </span>
            {prompt}
          </p>
        ) : null}
      </div>
    </div>
  );
}
