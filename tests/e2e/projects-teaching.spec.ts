import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { formatRange, formatYm, ymSortKey } from '../../src/lib/dates';

type Project = {
  title: string;
  order?: number;
  start?: string;
  end?: string;
  links?: { code?: string; paper?: string; demo?: string };
};

const yamlIn = <T>(dir: URL): T[] =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as T);

const projects = yamlIn<Project>(new URL('../../src/content/projects/', import.meta.url));
const teachingDir = new URL('../../src/content/teaching/', import.meta.url);
type Teaching = { role: string; start: string; end?: string };
const teachingEntries = existsSync(teachingDir) ? yamlIn<Teaching>(teachingDir) : [];
// Same order as teaching.astro: ongoing first, then most recent end, then most recent start.
const byRecency = (a: Teaching, b: Teaching) =>
  ymSortKey(b.end) - ymSortKey(a.end) || ymSortKey(b.start) - ymSortKey(a.start);
const teachingPage = load(readFileSync(new URL('../../src/content/pages/teaching.yaml', import.meta.url), 'utf8')) as {
  course_groups: { department: string; courses: string[] }[];
};

const entryOf = (page: import('@playwright/test').Page, title: string) =>
  page.locator('li').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

const sectionOf = (page: import('@playwright/test').Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });

test('projects has one h1 "Projects"', async ({ page }) => {
  await page.goto('/projects/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Projects');
});

test('every project title is an h3, sorted by order then title', async ({ page }) => {
  await page.goto('/projects/');
  const expected = [...projects]
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title))
    .map((p) => p.title);
  await expect(page.locator('h3')).toHaveText(expected);
});

test('each project shows only the links it has, with the right href', async ({ page }) => {
  await page.goto('/projects/');
  for (const p of projects) {
    const entry = entryOf(page, p.title);
    for (const [label, key] of [
      ['Code', 'code'],
      ['Paper', 'paper'],
      ['Demo', 'demo'],
    ] as const) {
      const link = entry.getByRole('link', { name: label, exact: true });
      const href = p.links?.[key];
      if (href) await expect(link).toHaveAttribute('href', href);
      else await expect(link).toHaveCount(0);
    }
  }
});

test('dated projects show their range; undated projects never show "Present"', async ({ page }) => {
  await page.goto('/projects/');
  for (const p of projects) {
    const text = await entryOf(page, p.title).innerText();
    if (p.start) {
      expect(text).toContain(formatRange(p.start, p.end));
    } else if (p.end) {
      expect(text).toContain(formatYm(p.end));
      expect(text).not.toContain('Present');
    } else {
      expect(text).not.toContain('Present');
    }
  }
});

test('teaching has one h1 "Teaching"', async ({ page }) => {
  await page.goto('/teaching/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Teaching');
});

test('teaching statement section is always present', async ({ page }) => {
  await page.goto('/teaching/');
  await expect(page.getByRole('heading', { name: 'Teaching Statement', level: 2, exact: true })).toHaveCount(1);
});

test('teaching experience h2 appears exactly when the collection has entries', async ({ page }) => {
  await page.goto('/teaching/');
  const section = sectionOf(page, 'Teaching Experience');
  if (teachingEntries.length > 0) {
    await expect(section).toHaveCount(1);
    const expected = [...teachingEntries].sort(byRecency).map((e) => e.role);
    await expect(section.locator('h3')).toHaveText(expected);
  } else {
    await expect(section).toHaveCount(0);
  }
});

test('courses h2 appears exactly when course_groups is non-empty', async ({ page }) => {
  await page.goto('/teaching/');
  const section = sectionOf(page, 'Courses I Can Teach');
  await expect(section).toHaveCount(teachingPage.course_groups.length > 0 ? 1 : 0);
});

test('course groups: one h3 per department in order, each with its courses joined by " · "', async ({ page }) => {
  await page.goto('/teaching/');
  const section = sectionOf(page, 'Courses I Can Teach');
  if (teachingPage.course_groups.length > 0) {
    await expect(section.locator('h3')).toHaveText(teachingPage.course_groups.map((g) => g.department));
    await expect(section.locator('p')).toHaveText(teachingPage.course_groups.map((g) => g.courses.join(' · ')));
  } else {
    await expect(section.locator('h3')).toHaveCount(0);
  }
});
