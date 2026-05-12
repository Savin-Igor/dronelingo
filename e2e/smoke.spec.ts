import { test, expect } from "@playwright/test";

test("landing page renders in default locale (lv)", async ({ page }) => {
  await page.goto("/lv");
  await expect(page).toHaveTitle(/dronelingo/i);
  // Hero heading is present
  await expect(page.locator("h1")).toBeVisible();
});

test("/api/health returns 200 with ok status", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.db).toBe("up");
});
