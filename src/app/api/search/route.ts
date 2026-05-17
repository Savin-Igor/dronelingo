import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchHybrid } from "@/lib/search/query";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Body = z.object({
  q: z.string().min(1).max(200),
  locale: z.enum(routing.locales).default(routing.defaultLocale),
  limit: z.number().int().min(1).max(50).optional(),
});

// Lightweight per-IP rate limit. In-memory window — fine for a single
// container; if we ever scale horizontally we'll move this to Postgres
// or a key/value store.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const buckets = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const stamps = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  stamps.push(now);
  buckets.set(ip, stamps);
  return stamps.length > MAX_REQUESTS;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Bad request", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const start = Date.now();
  try {
    const results = await searchHybrid(parsed.q, parsed.locale, parsed.limit);
    return NextResponse.json(
      { took: Date.now() - start, results },
      { status: 200 },
    );
  } catch (err) {
    console.error("search:error", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
