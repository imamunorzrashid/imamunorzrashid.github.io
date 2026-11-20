import { test, expect } from './fixtures';

const routes = [
  '/',
  '/research/',
  '/publications/',
  '/projects/',
  '/academics/',
  '/experience/',
  '/achievements/',
  '/teaching/',
  '/cv/',
  '/gallery/',
];

for (const route of routes) {
  test(`${route} returns 200 with exactly one h1`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test(`${route} does not scroll horizontally at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(route);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test(`${route} internal links all return 200`, async ({ page, request }) => {
    await page.goto(route);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    for (const href of new Set(hrefs)) {
      const res = await request.get(href);
      expect(res.status(), `${route} -> ${href}`).toBe(200);
    }
  });

  test(`${route} shows no visible TODO(Mamun)`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('TODO(Mamun)');
  });
}
