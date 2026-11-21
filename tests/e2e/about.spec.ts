import { test, expect, type Page } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { recentFirst } from '../../src/lib/dates';
import { buildTimeline } from '../../src/lib/timeline';

const dirOf = (name: string) => new URL(`../../src/content/${name}/`, import.meta.url);
const yamlIn = <T>(name: string): T[] => {
  const dir = dirOf(name);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as T);
};

type Profile = {
  about_opening?: string;
  skills: { label: string; items: string[] }[];
};
const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as Profile;

type Link = { label: string; url: string };
type Experience = {
  role: string;
  org: string;
  kind: 'research' | 'industry' | 'leadership';
  start: string;
  end?: string;
  link?: string;
  points: string[];
  links?: Link[];
};
type Education = { degree: string; start?: string; end?: string; logo?: string; story?: string; thesis_title?: string };
type Award = { title: string; category: string; date: string; end?: string; story?: string };
type Activity = { title: string; date: string; video?: string };
type Certificate = { title: string; date: string };
type Publication = { title: string; year?: number | null };
type Project = { title: string; story?: string; draft?: boolean; end?: string; outcome?: string };

const experience = yamlIn<Experience>('experience');
const education = yamlIn<Education>('education');
const awards = yamlIn<Award>('awards');
const activities = yamlIn<Activity>('activities');
const certificates = yamlIn<Certificate>('certificates');
const publications = yamlIn<Publication>('publications').map((p) => ({ ...p, year: p.year ?? undefined }));
const projects = readdirSync(dirOf('projects'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => ({ slug: f.replace(/\.yaml$/, ''), ...(load(readFileSync(new URL(f, dirOf('projects')), 'utf8')) as Project) }));
// Production skips drafts, so their stories are not linked from the timeline.
const stories = projects.filter((p) => p.story && !p.draft);

const work = recentFirst(experience, (e) => e.role);
const eduSorted = recentFirst(education, (e) => e.degree);
const awardsDated = awards.map((a) => ({ ...a, start: a.date, end: a.end ?? a.date }));
const awardsSorted = recentFirst(awardsDated, (a) => a.title);
const activitiesSorted = recentFirst(
  activities.map((a) => ({ ...a, start: a.date, end: a.date })),
  (a) => a.title,
);
const certsSorted = recentFirst(
  certificates.map((c) => ({ ...c, start: c.date, end: c.date })),
  (c) => c.title,
);
const skills = profile.skills.filter((s) => s.items.length > 0);
// Same input order as about.astro: sorted lists go in, so same-year ties come out the same way.
const timeline = buildTimeline({
  education: eduSorted as never,
  experience: work as never,
  awards: awardsSorted as never,
  publications: publications as never,
  stories: stories.map((p) => ({ slug: p.slug, title: p.title, end: p.end, outcome: p.outcome })),
});
const timelineLines = timeline.flatMap((g) => g.items);

const sectionOf = (page: Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });

const linksOf = (e: Experience) => [...(e.link ? [{ label: 'Website', url: e.link }] : []), ...(e.links ?? [])];

test.describe('About page', () => {
  test('has one h1 "About"', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('About');
  });

  test('opening paragraph renders only when about_opening is set', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('.prose')).toHaveCount(profile.about_opening ? 1 : 0);
  });

  test('h2 sections are in order and each appears only when it has items', async ({ page }) => {
    await page.goto('/about/');
    const expected = [
      ...(timeline.length > 0 ? ['Timeline'] : []),
      ...(education.length > 0 ? ['Education'] : []),
      ...(experience.length > 0 ? ['Work'] : []),
      ...(awards.length > 0 || certificates.length > 0 ? ['Recognition'] : []),
      ...(skills.length > 0 ? ['Skills'] : []),
      ...(activities.length > 0 ? ['Talks and service'] : []),
    ];
    await expect(page.locator('h2')).toHaveText(expected);
  });

  test('timeline years sit in the margin, newest first, and each line links to its target', async ({ page }) => {
    test.skip(timeline.length === 0, 'no dated items yet');
    await page.goto('/about/');
    const section = sectionOf(page, 'Timeline');
    await expect(section.locator('.year')).toHaveText(timeline.map((g) => g.year));
    const links = section.locator('a');
    await expect(links).toHaveCount(timelineLines.length);
    for (const [i, line] of timelineLines.entries()) {
      await expect(links.nth(i)).toHaveText(line.text);
      await expect(links.nth(i)).toHaveAttribute('href', line.href);
    }
  });

  test('education entries are ordered by recency', async ({ page }) => {
    await page.goto('/about/');
    await expect(sectionOf(page, 'Education').locator('h3')).toHaveText(eduSorted.map((e) => e.degree));
  });

  test('an education entry with a logo shows an empty-alt image inside that entry', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Education');
    for (const [i, e] of eduSorted.entries()) {
      if (!e.logo) continue;
      await expect(section.locator('.entry').nth(i).locator('img[alt=""]')).toHaveCount(1);
    }
  });

  test('a thesis title links to its story when the education entry has one', async ({ page }) => {
    await page.goto('/about/');
    for (const e of education) {
      if (!e.story || !e.thesis_title) continue;
      await expect(sectionOf(page, 'Education').locator(`a[href="/projects/${e.story}/"]`)).toHaveCount(1);
    }
  });

  test('work entries are ordered by recency and render points as paragraphs, never list items', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Work');
    await expect(section.locator('h3')).toHaveText(work.map((e) => e.role));
    await expect(section.locator('li')).toHaveCount(0);
    for (const [i, e] of work.entries()) {
      const entry = section.locator('.entry').nth(i);
      for (const pt of e.points) {
        await expect(entry.locator('p', { hasText: pt })).toHaveCount(1);
      }
    }
  });

  test('Website and other work links render in display order, one per link', async ({ page }) => {
    await page.goto('/about/');
    const expected = work.flatMap(linksOf);
    const links = sectionOf(page, 'Work').locator('a');
    await expect(links).toHaveCount(expected.length);
    for (const [i, l] of expected.entries()) {
      await expect(links.nth(i)).toHaveText(l.label);
      await expect(links.nth(i)).toHaveAttribute('href', l.url);
    }
  });

  test('awards with a story link to /projects/<story>/', async ({ page }) => {
    await page.goto('/about/');
    for (const a of awards) {
      if (!a.story) continue;
      await expect(sectionOf(page, 'Recognition').locator(`a[href="/projects/${a.story}/"]`)).toHaveCount(1);
    }
  });

  test('certificates list after awards, one line each', async ({ page }) => {
    test.skip(certificates.length === 0, 'no certificates yet');
    await page.goto('/about/');
    const section = sectionOf(page, 'Recognition');
    await expect(section.locator('h3')).toHaveText([...awardsSorted.map((a) => a.title), 'Certificates']);
    const certs = section.locator('ul.certs li');
    await expect(certs).toHaveCount(certsSorted.length);
    for (const [i, c] of certsSorted.entries()) await expect(certs.nth(i)).toContainText(c.title);
  });

  test('Skills lines match profile.yaml', async ({ page }) => {
    test.skip(skills.length === 0, 'no skills yet');
    await page.goto('/about/');
    const lines = skills.map((s) => `${s.label}: ${s.items.join(' · ')}`);
    await expect(sectionOf(page, 'Skills').locator('p')).toHaveText(lines);
  });

  test('talks are ordered by recency and each video link is present', async ({ page }) => {
    test.skip(activities.length === 0, 'no talks yet');
    await page.goto('/about/');
    const section = sectionOf(page, 'Talks and service');
    await expect(section.locator('h3')).toHaveText(activitiesSorted.map((a) => a.title));
    for (const a of activities) {
      if (!a.video) continue;
      await expect(section.locator(`a[href="${a.video}"]`).first()).toHaveCount(1);
    }
  });

  test('page text never contains a phone number or a referee', async ({ page }) => {
    await page.goto('/about/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
    expect(text).not.toMatch(/referee|references/i);
  });
});

const oldPages: [string, RegExp][] = [
  ['/academics/', /\/about\/#education$/],
  ['/experience/', /\/about\/#work$/],
  ['/achievements/', /\/about\/#recognition$/],
];

for (const [from, target] of oldPages) {
  test(`${from} redirects to its About section`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(target);
  });
}
