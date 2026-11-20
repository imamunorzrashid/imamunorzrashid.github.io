import { test, expect } from '@playwright/test';

const ORDER = ['Journal Articles', 'Conference Papers', 'Accepted', 'Under Review', 'In Preparation'];

const groupOf = (page: import('@playwright/test').Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, exact: true }) });

test('publications h2s are a known subset in the expected order', async ({ page }) => {
  await page.goto('/publications/');
  const headings = await page.locator('h2').allTextContents();
  expect(headings.length).toBeGreaterThan(0);
  for (const h of headings) expect(ORDER).toContain(h);
  const idx = headings.map((h) => ORDER.indexOf(h));
  expect(idx).toEqual([...idx].sort((a, b) => a - b));
});

test('Next Energy is listed under Accepted as [S1]', async ({ page }) => {
  await page.goto('/publications/');
  const accepted = groupOf(page, 'Accepted');
  await expect(accepted).toContainText('[S1]');
  await expect(accepted).toContainText('Next Energy');
});

test('every DOI link has a non-empty path', async ({ page }) => {
  await page.goto('/publications/');
  const hrefs = await page
    .locator('a[href^="https://doi.org/"]')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
  for (const href of hrefs) expect(new URL(href).pathname.length).toBeGreaterThan(1);
});

test('no publication text contains "undefined" or "null"', async ({ page }) => {
  await page.goto('/publications/');
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/undefined|null/);
});

test('in-preparation entries have no DOI link and no year', async ({ page }) => {
  await page.goto('/publications/');
  const group = groupOf(page, 'In Preparation');
  const n = await group.count();
  test.skip(n === 0, 'No in-preparation publications (PADV review removed by Mamun 2026-11-20)');
  const items = group.locator('li');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const li = items.nth(i);
    await expect(li.locator('a[href^="https://doi.org/"]')).toHaveCount(0);
    expect(await li.innerText()).not.toMatch(/\b\d{4}\b/);
  }
});

test('research has one h1 "Research"', async ({ page }) => {
  await page.goto('/research/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Research');
});

test('research has at least one h2', async ({ page }) => {
  await page.goto('/research/');
  const n = await page.locator('h2').count();
  test.skip(n === 0, 'research themes empty until Task 9');
  expect(n).toBeGreaterThan(0);
});
