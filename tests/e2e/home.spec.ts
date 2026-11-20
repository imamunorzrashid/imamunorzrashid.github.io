import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as {
  name: string;
};

test('home has exactly one h1 with the profile name', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText(profile.name);
});

test('header nav has the nine main links in order', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav a')).toHaveText([
    'Home',
    'Research',
    'Publications',
    'Projects',
    'Academics',
    'Experience',
    'Achievements',
    'Teaching',
    'CV',
  ]);
});

test('at 1280px the nav is one row, level with the site name', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tops = await page.locator('header nav a').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(tops).toHaveLength(9);
  for (const y of tops) expect(Math.abs(y - tops[0])).toBeLessThan(1);
  const nameTop = await page.locator('header .site-name').evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(nameTop - tops[0])).toBeLessThan(8);
});

test('home does not scroll horizontally at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(375);
});

const redirects: [string, RegExp][] = [
  ['#research', /\/research\/$/],
  ['#publications', /\/publications\/$/],
  ['#projects', /\/projects\/$/],
  ['#gallery', /\/gallery\/$/],
  ['#education', /\/academics\/$/],
  ['#leadership', /\/experience\/$/],
  ['#industry', /\/experience\/$/],
  ['#honors', /\/achievements\/$/],
  ['#certifications', /\/achievements\/$/],
];

for (const [hash, target] of redirects) {
  test(`/${hash} redirects to its page`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page).toHaveURL(target);
  });
}

for (const hash of ['#home', '#contact']) {
  test(`/${hash} stays on the home page`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page).toHaveURL(new RegExp(`/${hash}$`));
    expect(new URL(page.url()).pathname).toBe('/');
  });
}

test('footer shows the last updated line', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('Last updated');
});

test('body uses Source Serif 4', async ({ page }) => {
  await page.goto('/');
  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toContain('Source Serif 4 Variable');
});
