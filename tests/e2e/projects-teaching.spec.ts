import { test, expect } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { formatRange, formatYm } from '../../src/lib/dates';

type Project = {
  title: string;
  kind?: string;
  order?: number;
  start?: string;
  end?: string;
  links?: { label: string; url: string }[];
  story?: string;
  draft?: boolean;
};

const yamlIn = <T>(dir: URL): T[] =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as T);

// Projects lists only build projects; research projects live on the Research page. A missing kind means build.
const allProjects = yamlIn<Project>(new URL('../../src/content/projects/', import.meta.url));
const projects = allProjects.filter((p) => (p.kind ?? 'build') === 'build');
const researchProjects = allProjects.filter((p) => p.kind === 'research');

const entryOf = (page: import('@playwright/test').Page, title: string) =>
  page.locator('li').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('projects has one h1 "Projects"', async ({ page }) => {
  await page.goto('/projects/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Projects');
});

test('research projects are not listed on Projects or the home page', async ({ page }) => {
  test.skip(researchProjects.length === 0, 'no research projects yet');
  for (const path of ['/projects/', '/']) {
    await page.goto(path);
    for (const p of researchProjects) {
      await expect(page.getByRole('heading', { name: p.title, exact: true })).toHaveCount(0);
    }
  }
});

test('the Research page links to the story of each published research project', async ({ page }) => {
  const published = researchProjects.filter((p) => p.story && !p.draft);
  test.skip(published.length === 0, 'no research project has a published story yet');
  await page.goto('/research/');
  for (const p of published) {
    await expect(page.locator(`a[href="/projects/${p.story}/"]`).first()).toHaveCount(1);
  }
});

test('every project title is an h3, sorted by order then title', async ({ page }) => {
  await page.goto('/projects/');
  const expected = [...projects]
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title))
    .map((p) => p.title);
  await expect(page.locator('h3')).toHaveText(expected);
});

test('each project shows exactly its links, with the right labels and hrefs', async ({ page }) => {
  await page.goto('/projects/');
  for (const p of projects) {
    const entry = entryOf(page, p.title);
    for (const l of p.links ?? []) {
      await expect(entry.getByRole('link', { name: l.label, exact: true })).toHaveAttribute('href', l.url);
    }
    await expect(entry.getByRole('link')).toHaveCount(p.links?.length ?? 0);
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
