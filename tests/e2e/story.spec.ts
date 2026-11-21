import { test, expect } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';

type Project = { title: string; order?: number; draft?: boolean; story?: string };
type Story = Project & { slug: string };

const dir = new URL('../../src/content/projects/', import.meta.url);
const projects: Story[] = readdirSync(dir)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => ({ slug: f.replace(/\.yaml$/, ''), ...(load(readFileSync(new URL(f, dir), 'utf8')) as Project) }));

// Same order as projects.astro: order, then title. Production skips drafts.
const published = projects
  .filter((p) => p.story && !p.draft)
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title));

test('a draft story is not built in production', async ({ page }) => {
  const draft = projects.find((p) => p.slug === 'ecmx-transfer-learning');
  test.skip(!draft?.draft || !draft.story, 'ECMX story is not a draft');
  const res = await page.goto('/projects/ecmx-transfer-learning/');
  expect(res?.status()).toBe(404);
});

test.describe('published stories', () => {
  test.skip(published.length === 0, 'no published stories yet');

  for (const [i, s] of published.entries()) {
    test(`${s.slug}: one h1 equal to the title`, async ({ page }) => {
      await page.goto(`/projects/${s.slug}/`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(s.title);
    });

    test(`${s.slug}: figure captions numbered Fig. 1, 2, ... in order`, async ({ page }) => {
      await page.goto(`/projects/${s.slug}/`);
      const captions = await page.locator('figcaption').allInnerTexts();
      captions.forEach((c, n) => expect(c).toMatch(new RegExp(`^Fig\\. ${n + 1}\\.`)));
    });

    test(`${s.slug}: no dt without a filled dd`, async ({ page }) => {
      await page.goto(`/projects/${s.slug}/`);
      const empty = await page.locator('dl').evaluateAll((dls) =>
        dls.flatMap((dl) =>
          [...dl.querySelectorAll('dt')]
            .filter((dt) => {
              const dd = dt.nextElementSibling;
              return dd?.tagName !== 'DD' || !dd.textContent?.trim();
            })
            .map((dt) => dt.textContent),
        ),
      );
      expect(empty).toEqual([]);
    });

    test(`${s.slug}: no iframe before a click`, async ({ page }) => {
      await page.goto(`/projects/${s.slug}/`);
      await expect(page.locator('iframe')).toHaveCount(0);
    });

    test(`${s.slug}: back link and neighbouring story links`, async ({ page }) => {
      await page.goto(`/projects/${s.slug}/`);
      await expect(page.getByRole('link', { name: '← All projects' })).toHaveAttribute('href', '/projects/');
      const prev = published[i - 1];
      const next = published[i + 1];
      if (prev) {
        await expect(page.getByRole('link', { name: /Previous story/ })).toHaveAttribute(
          'href',
          `/projects/${prev.slug}/`,
        );
      }
      if (next) {
        await expect(page.getByRole('link', { name: /Next story/ })).toHaveAttribute('href', `/projects/${next.slug}/`);
      }
    });
  }
});
