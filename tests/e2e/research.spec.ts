import { test, expect, type Page } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';

type Theme = { title: string; story?: string; image?: { src: string; alt: string; caption?: string } };
type Project = { story?: string; draft?: boolean };

const research = load(readFileSync(new URL('../../src/content/pages/research.yaml', import.meta.url), 'utf8')) as {
  questions?: string[];
  themes: Theme[];
};
const themes = research.themes;
const questions = research.questions ?? [];

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

test('questions appear under their own h2 only when the YAML lists some', async ({ page }) => {
  await page.goto('/research/');
  const heading = page.getByRole('heading', { level: 2, name: "Questions I'm working on", exact: true });
  if (questions.length === 0) {
    await expect(heading).toHaveCount(0);
    return;
  }
  const items = page.locator('section.section', { has: heading }).locator('li');
  await expect(items).toHaveText(questions);
});

test('a theme with an image shows its figure above the summary; other themes show none', async ({ page }) => {
  await page.goto('/research/');
  for (const t of themes) {
    const section = themeSection(page, t.title);
    const figure = section.locator('figure');
    if (!t.image?.src) {
      await expect(figure).toHaveCount(0);
      continue;
    }
    await expect(figure).toHaveCount(1);
    await expect(figure.locator('img')).toHaveAttribute('src', t.image.src);
    await expect(figure.locator('img')).toHaveAttribute('alt', t.image.alt);
    if (t.image.caption) await expect(figure.locator('figcaption')).toHaveText(t.image.caption);
    const figureBox = await figure.boundingBox();
    const summaryBox = await section.locator('.prose').boundingBox();
    expect(figureBox!.y).toBeLessThan(summaryBox!.y);
  }
});

test('a theme without a published story shows no "Read the story" link', async ({ page }) => {
  await page.goto('/research/');
  for (const t of unlinked) {
    await expect(themeSection(page, t.title)).toHaveCount(1);
    await expect(themeSection(page, t.title).getByRole('link', { name: 'Read the story' })).toHaveCount(0);
  }
});
