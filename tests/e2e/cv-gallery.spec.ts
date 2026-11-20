import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { ymSortKey } from '../../src/lib/dates';

const yamlIn = <T>(name: string): T[] => {
  const dir = new URL(`../../src/content/${name}/`, import.meta.url);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as T);
};

type Profile = {
  cv_academic?: string;
  cv_lecturer?: string;
};
const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as Profile;

type Gallery = { caption: string; alt: string; date?: string };

const gallery = yamlIn<Gallery>('gallery');

test.describe('CV page', () => {
  test('has one h1 "CV"', async ({ page }) => {
    await page.goto('/cv/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('CV');
  });

  test('has no h2 sections', async ({ page }) => {
    await page.goto('/cv/');
    await expect(page.locator('h2')).toHaveCount(0);
  });

  test('page text never contains a phone number', async ({ page }) => {
    await page.goto('/cv/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
  });

  test('CV download links render only for set profile values', async ({ page }) => {
    await page.goto('/cv/');
    for (const [label, value] of [
      ['Academic CV (PDF)', profile.cv_academic],
      ['Teaching CV (PDF)', profile.cv_lecturer],
    ] as const) {
      const link = page.getByRole('link', { name: label, exact: true });
      if (value) await expect(link).toHaveAttribute('href', value);
      else await expect(link).toHaveCount(0);
    }
  });
});

test.describe('Gallery page', () => {
  test('has one h1 "Gallery"', async ({ page }) => {
    await page.goto('/gallery/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Gallery');
  });

  test('every img has a non-empty alt, and the figure count equals the gallery entries', async ({ page }) => {
    await page.goto('/gallery/');
    const alts = await page.locator('main img').evaluateAll((els) => els.map((el) => el.getAttribute('alt') ?? ''));
    expect(alts).toHaveLength(gallery.length);
    for (const alt of alts) expect(alt.trim()).not.toBe('');
    await expect(page.locator('figure')).toHaveCount(gallery.length);
    await expect(page.locator('figure figcaption')).toHaveText(
      [...gallery]
        .sort(
          (a, b) =>
            (b.date ? ymSortKey(b.date) : -1) - (a.date ? ymSortKey(a.date) : -1) || a.caption.localeCompare(b.caption),
        )
        .map((g) => g.caption),
    );
  });
});
