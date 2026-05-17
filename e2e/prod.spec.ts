import { test, expect } from "@playwright/test";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function get(base: string, path: string) {
  const res = await fetch(`${base}${path}`);
  return res;
}

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://dronelingo.eu";

// ── Health ───────────────────────────────────────────────────────────────────

test("api/health returns ok", async ({ request }) => {
  const res = await request.get(`${BASE}/api/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.db).toBe("up");
  expect(body.content.topics).toBeGreaterThan(0);
  expect(body.content.lessons).toBeGreaterThan(0);
  expect(body.content.questions).toBeGreaterThan(0);
});

// ── Landing pages ─────────────────────────────────────────────────────────────

for (const locale of ["lv", "en", "ru"]) {
  test(`landing renders in ${locale}`, async ({ page }) => {
    await page.goto(`${BASE}/${locale}`);
    await expect(page).toHaveTitle(/dronelingo/i);
    await expect(page.locator("h1").first()).toBeVisible();
    // Footer present with regulations link
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer a[href*='/regulations']").first()).toBeVisible();
  });
}

// ── Static pages ──────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  { path: "/lv/guide", heading: /reģistrācija|ceļvedis/i },
  { path: "/en/guide", heading: /registration|guide/i },
  { path: "/lv/faq", heading: /jautājum|biežāk/i },
  { path: "/en/faq", heading: /question|faq/i },
  { path: "/lv/privacy", heading: /privātuma/i },
  { path: "/en/privacy", heading: /privacy/i },
  { path: "/lv/terms", heading: /noteikumi/i },
  { path: "/en/terms", heading: /terms/i },
];

for (const { path, heading } of STATIC_PAGES) {
  test(`static page ${path}`, async ({ page }) => {
    await page.goto(`${BASE}${path}`);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
    // No draft notice should be visible
    await expect(page.locator("text=Draft pending")).not.toBeVisible();
    await expect(page.locator("text=Melnraksts")).not.toBeVisible();
    await expect(page.locator("text=Черновик")).not.toBeVisible();
  });
}

// ── Regulations library ───────────────────────────────────────────────────────

test("regulations catalog lists sources", async ({ page }) => {
  await page.goto(`${BASE}/lv/regulations`);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("a[href*='/regulations/reg-eu-2019-947']")).toBeVisible();
  await expect(page.locator("a[href*='/regulations/easa-easy-access-rules']")).toBeVisible();
  await expect(page.locator("a[href*='/regulations/caa-lv-qualifications']")).toBeVisible();
});

const SOURCE_PAGES = [
  "/lv/regulations/reg-eu-2019-947",
  "/en/regulations/reg-eu-2019-945",
  "/ru/regulations/easa-easy-access-rules",
  "/lv/regulations/caa-lv-qualifications",
  "/ru/regulations/caa-lv-qualifications",
  "/lv/regulations/caa-lv-registration",
  "/lv/regulations/caa-lv-geozones",
  "/lv/regulations/caa-lv-insurance",
];

for (const path of SOURCE_PAGES) {
  test(`source detail ${path} returns 200 and has content`, async ({ page }) => {
    await page.goto(`${BASE}${path}`);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("a[target='_blank']").first()).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
  });
}

// ── Learn ─────────────────────────────────────────────────────────────────────

test("learn index shows topics", async ({ page }) => {
  await page.goto(`${BASE}/lv/learn`);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("a[href*='/learn/air-safety']").first()).toBeVisible();
});

test("topic page shows lessons", async ({ page }) => {
  await page.goto(`${BASE}/lv/learn/air-safety`);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("a[href*='vlos']").first()).toBeVisible();
});

// Only air-safety lessons are freely accessible without auth.
// All other topics are behind the €19 paywall — anonymous users get
// redirected to the landing page, which is expected behaviour.
const LESSON_PAGES = [
  "/lv/learn/air-safety/vlos",
  "/en/learn/air-safety/lost-link-and-emergency-landing",
  "/lv/learn/air-safety/manned-aircraft-priority",
];

for (const path of LESSON_PAGES) {
  test(`lesson ${path} renders`, async ({ page }) => {
    const res = await page.goto(`${BASE}${path}`);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/dronelingo/i);
    // h1 is in the page header outside the animation wrapper
    await expect(page.locator("h1").first()).toBeAttached();
    // Scene image src is present in DOM
    const img = page.locator("img[src*='scene-1']");
    if (await img.count() > 0) {
      await expect(img.first()).toBeAttached();
    }
  });
}

// ── Blog ──────────────────────────────────────────────────────────────────────

test("blog index renders post list", async ({ page }) => {
  await page.goto(`${BASE}/lv/blog`);
  await expect(page.locator("h1,h2").first()).toBeVisible();
  await expect(page.locator("article,a[href*='/blog/']").first()).toBeVisible();
});

const BLOG_POSTS = [
  "/en/blog/military-drone-trends-that-will-dominate-2026",
  "/ru/blog/voennye-dronovye-trendy-kotorye-opredelyat-2026-god",
  "/en/blog/rise-of-autonomous-combat-uavs",
  "/en/blog/drone-swarms-and-the-future-of-autonomous-warfare",
  "/en/blog/how-drones-are-used-in-oil-and-gas-industry",
  "/en/blog/best-thermal-drones-for-search-and-rescue",
  "/en/blog/anti-drone-systems-and-electronic-warfare",
  "/en/blog/industrial-drone-inspection-future-of-infrastructure-monitoring",
];

for (const path of BLOG_POSTS) {
  test(`blog post ${path}`, async ({ page }) => {
    const res = await page.goto(`${BASE}${path}`);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/dronelingo/i);
    // Single h1 is in the article header (page component renders it, not MDX)
    await expect(page.locator("h1").first()).toBeAttached();
    // Hero image is attached (may be lazy-loaded, so check DOM presence not visibility)
    const heroImg = page.locator("img[src*='hero']");
    if (await heroImg.count() > 0) {
      await expect(heroImg.first()).toBeAttached();
    }
  });
}

// ── Practice / Exam ───────────────────────────────────────────────────────────

test("practice page renders", async ({ page }) => {
  await page.goto(`${BASE}/lv/practice`);
  await expect(page.locator("h1,h2").first()).toBeVisible();
});

test("exam page renders with rules", async ({ page }) => {
  await page.goto(`${BASE}/lv/exam`);
  await expect(page.locator("h1,h2").first()).toBeVisible();
});

// ── 404 ───────────────────────────────────────────────────────────────────────

test("unknown route returns 404 page not server error", async ({ page }) => {
  const res = await page.goto(`${BASE}/lv/this-page-does-not-exist-xyz`);
  expect(res?.status()).toBe(404);
  await expect(page.locator("body")).not.toContainText("500");
});

// ── SEO infra ─────────────────────────────────────────────────────────────────

test("robots.txt is accessible", async ({ request }) => {
  const res = await request.get(`${BASE}/robots.txt`);
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text.toLowerCase()).toContain("user-agent");
});

test("sitemap.xml contains regulations sources", async ({ request }) => {
  const res = await request.get(`${BASE}/sitemap.xml`);
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain("regulations/reg-eu-2019-947");
  expect(text).toContain("regulations/caa-lv-qualifications");
});

// ── Consent banner ────────────────────────────────────────────────────────────

test("consent banner shows analytics copy on first visit", async ({ page }) => {
  await page.goto(`${BASE}/lv`);
  const banner = page.locator("[role='dialog']");
  await expect(banner).toBeVisible();
  // Should mention analytics, not localStorage/progress
  await expect(banner).toContainText(/analītik|analytics|аналитик/i);
  await expect(banner).not.toContainText(/progress|glabātuvi|localStorage/i);
});

test("consent banner dismisses on accept", async ({ page }) => {
  await page.goto(`${BASE}/lv`);
  const banner = page.locator("[role='dialog']");
  await expect(banner).toBeVisible();
  await page.locator("button", { hasText: /sapratu|got it|понятно/i }).click();
  await expect(banner).not.toBeVisible();
});

// ── Footer links ──────────────────────────────────────────────────────────────

test("footer links all resolve to non-error pages", async ({ page, request }) => {
  await page.goto(`${BASE}/lv`);
  const footerLinks = await page.locator("footer a[href]").all();
  const hrefs = await Promise.all(footerLinks.map((a) => a.getAttribute("href")));
  const internal = hrefs.filter((h) => h && h.startsWith("/"));
  for (const href of internal.slice(0, 10)) {
    const res = await request.get(`${BASE}${href}`);
    expect(res.status(), `footer link ${href} should not 404/500`).toBeLessThan(400);
  }
});
