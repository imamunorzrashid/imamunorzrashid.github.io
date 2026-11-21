import { test, expect, type Page } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';

type Theme = { title: string; story?: string };
type Project = { story?: string; draft?: boolean };

const themes = (load(readFileSync(new URL('../../src/content/pages/research.yaml', import.meta.url), 'utf8')) as {
  themes: Theme[];
}).themes;

// Same rule as /projects/[slug]/: a story is linked only when its project has a story and is not a draft.
const dir = new URL('../../src/content/projects/', import.meta.url);
const published = new Set(
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .filter((f) => {
      const p = load(readFileSync(new URL(f, dir), 'utf8')) as Project;
      return !!p.story && !p.draft;
    })
    .map((f) => f.replace(/\.yaml$/, '')),
);

const linked = themes.filter((t) => t.story && published.has(t.story));
const unlinked = themes.filter((t) => !(t.story && published.has(t.story)));

const themeSection = (page: Page, title: string) =>
  page.locator('section.section', { has: page.getByRole('heading', { level: 2, name: title, exact: true }) });

test.describe('research themes and stories', () => {
  test.skip(linked.length === 0, 'no theme has a published story yet');

  for (const t of linked) {
    test(`"${t.title}" links to its published story`, async ({ page }) => {
      await page.goto('/research/');
      const link = themeSection(page, t.title).getByRole('link', { name: 'Read the story' });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', `/projects/${t.story}/`);
    });
  }
});

test('a theme without a published story shows no "Read the story" link', async ({ page }) => {
  await page.goto('/research/');
  for (const t of unlinked) {
    await expect(themeSection(page, t.title)).toHaveCount(1);
    await expect(themeSection(page, t.title).getByRole('link', { name: 'Read the story' })).toHaveCount(0);
  }
});
