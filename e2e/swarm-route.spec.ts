import { test, expect } from "@playwright/test";

test.describe("Swarm route", () => {
  test("/swarm is protected and redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/swarm");
    // Middleware issues a 307 redirect to /login for unauthenticated users
    // Playwright follows redirects, so we check the final URL
    // The redirect chain: /swarm → /login?redirect=%2Fswarm → /
    const url = page.url();
    // We should NOT still be on /swarm (we got redirected away)
    expect(url).not.toContain("/swarm");
  });

  test("/mc returns 404 (old route removed)", async ({ page }) => {
    const response = await page.goto("/mc");
    expect(response).not.toBeNull();
    const is404 = response!.status() === 404;
    const bodyText = await page.textContent("body");
    const hasNotFound = bodyText?.toLowerCase().includes("not found") ?? false;
    expect(is404 || hasNotFound).toBe(true);
  });

  test("/swarm middleware redirect includes redirect param", async ({
    request,
  }) => {
    // Use API request context (no redirect following) to verify the 307
    const response = await request.get("/swarm", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(location).toContain("/login");
    expect(location).toContain("redirect=%2Fswarm");
  });
});
