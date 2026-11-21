import { test, expect } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';

const research = load(readFileSync(new URL('../../src/content/pages/research.yaml', import.meta.url), 'utf8')) as {
  questions?: string[];
  themes?: { title: string }[];
};

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
  const entry = groupOf(page, 'Accepted').locator('li').filter({ hasText: 'Next Energy' });
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveText(/^\[S1\]/);
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
  const text = await page.locator('body').innerText();
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

test('each publication shows an Abstract fold-out only when its YAML has an abstract', async ({ page }) => {
  await page.goto('/publications/');
  const dir = new URL('../../src/content/publications/', import.meta.url);
  const pubs = readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as { title: string; abstract?: string });
  for (const pub of pubs) {
    const entry = page.locator('li').filter({ hasText: pub.title });
    await expect(entry).toHaveCount(1);
    const details = entry.locator('details');
    if (pub.abstract) {
      await expect(details).toHaveCount(1);
      await expect(details.locator('summary')).toHaveText('Abstract');
    } else {
      await expect(details).toHaveCount(0);
    }
  }
});

test('plain line, Slides and Video show only when the YAML sets them', async ({ page }) => {
  await page.goto('/publications/');
  const dir = new URL('../../src/content/publications/', import.meta.url);
  const pubs = readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as { title: string; plain?: string; slides?: string; video?: string });
  for (const pub of pubs) {
    const entry = page.locator('li').filter({ hasText: pub.title });
    await expect(entry).toHaveCount(1);
    const plain = entry.locator('.plain');
    if (pub.plain) await expect(plain).toHaveText(pub.plain);
    else await expect(plain).toHaveCount(0);
    const slides = entry.getByRole('link', { name: 'Slides', exact: true });
    if (pub.slides) await expect(slides).toHaveAttribute('href', pub.slides);
    else await expect(slides).toHaveCount(0);
    const video = entry.getByRole('link', { name: 'Video', exact: true });
    if (pub.video) await expect(video).toHaveAttribute('href', pub.video);
    else await expect(video).toHaveCount(0);
  }
});

test('research has one h1 "Research"', async ({ page }) => {
  await page.goto('/research/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Research');
});

test('research has one h2 per theme, in order, after the questions h2 when there are questions', async ({ page }) => {
  const themes = research.themes ?? [];
  test.skip(themes.length === 0, 'research themes empty until Task 9');
  await page.goto('/research/');
  const headings = [
    ...((research.questions ?? []).length > 0 ? ["Questions I'm working on"] : []),
    ...themes.map((t) => t.title),
  ];
  const h2s = page.locator('main h2');
  await expect(h2s).toHaveCount(headings.length);
  await expect(h2s).toHaveText(headings);
});
