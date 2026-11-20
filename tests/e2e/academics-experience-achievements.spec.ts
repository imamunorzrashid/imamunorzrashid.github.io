import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { recentFirst } from '../../src/lib/dates';

const yamlIn = <T>(name: string): T[] => {
  const dir = new URL(`../../src/content/${name}/`, import.meta.url);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => load(readFileSync(new URL(f, dir), 'utf8')) as T);
};

type Profile = { skills: { label: string; items: string[] }[] };
const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as Profile;

type Experience = {
  role: string;
  kind: 'research' | 'industry' | 'leadership';
  start: string;
  end?: string;
  link?: string;
  points: string[];
};
type Education = { degree: string; start?: string; end?: string };
type Award = { title: string; category: 'academic' | 'international'; date: string; end?: string };
type Activity = { title: string; date: string };
type Certificate = { title: string; date: string };

const experience = yamlIn<Experience>('experience');
const education = yamlIn<Education>('education');
const awards = yamlIn<Award>('awards');
const activities = yamlIn<Activity>('activities');
const certificates = yamlIn<Certificate>('certificates');

const ofKind = (kind: Experience['kind']) => recentFirst(experience.filter((e) => e.kind === kind), (e) => e.role);
const eduSorted = recentFirst(education, (e) => e.degree);
const awardsDated = awards.map((a) => ({ ...a, start: a.date, end: a.end ?? a.date }));
const academic = recentFirst(awardsDated.filter((a) => a.category === 'academic'), (a) => a.title);
const international = recentFirst(awardsDated.filter((a) => a.category === 'international'), (a) => a.title);
const activitiesSorted = recentFirst(
  activities.map((a) => ({ ...a, start: a.date, end: a.date })),
  (a) => a.title,
);
const certsSorted = recentFirst(
  certificates.map((c) => ({ ...c, start: c.date, end: c.date })),
  (c) => c.title,
);

const sectionOf = (page: Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });

test.describe('Academics page', () => {
  test('has one h1 "Academics"', async ({ page }) => {
    await page.goto('/academics/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Academics');
  });

  test('h2 sections are Education then Technical Skills, each only when it has items', async ({ page }) => {
    await page.goto('/academics/');
    const expected = [
      ...(education.length > 0 ? ['Education'] : []),
      ...(profile.skills.length > 0 ? ['Technical Skills'] : []),
    ];
    await expect(page.locator('h2')).toHaveText(expected);
  });

  test('education entries are ordered by recency', async ({ page }) => {
    await page.goto('/academics/');
    await expect(sectionOf(page, 'Education').locator('h3')).toHaveText(eduSorted.map((e) => e.degree));
  });

  test('Technical Skills lines match profile.yaml', async ({ page }) => {
    await page.goto('/academics/');
    const lines = profile.skills.map((s) => `${s.label}: ${s.items.join(', ')}`);
    await expect(sectionOf(page, 'Technical Skills').locator('p')).toHaveText(lines);
  });

  test('page text never contains a phone number or a referee', async ({ page }) => {
    await page.goto('/academics/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
    expect(text).not.toMatch(/referee|references/i);
  });
});

test.describe('Experience page', () => {
  test('has one h1 "Experience"', async ({ page }) => {
    await page.goto('/experience/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Experience');
  });

  test('h2 sections are in order and appear exactly when they have items', async ({ page }) => {
    await page.goto('/experience/');
    const present: Record<string, boolean> = {
      'Research Experience': ofKind('research').length > 0,
      'Industry Experience': ofKind('industry').length > 0,
      Leadership: ofKind('leadership').length > 0,
      'Talks and Service': activities.length > 0,
    };
    const expected = Object.keys(present).filter((s) => present[s]);
    await expect(page.locator('h2')).toHaveText(expected);
  });

  test('entries inside each section are ordered by recency', async ({ page }) => {
    await page.goto('/experience/');
    await expect(sectionOf(page, 'Research Experience').locator('h3')).toHaveText(ofKind('research').map((e) => e.role));
    await expect(sectionOf(page, 'Industry Experience').locator('h3')).toHaveText(ofKind('industry').map((e) => e.role));
    await expect(sectionOf(page, 'Leadership').locator('h3')).toHaveText(ofKind('leadership').map((e) => e.role));
    await expect(sectionOf(page, 'Talks and Service').locator('h3')).toHaveText(activitiesSorted.map((a) => a.title));
  });

  test('an experience entry with one point renders it as a paragraph, not a list item', async ({ page }) => {
    await page.goto('/experience/');
    for (const [heading, kind] of [
      ['Research Experience', 'research'],
      ['Industry Experience', 'industry'],
      ['Leadership', 'leadership'],
    ] as const) {
      for (const [i, e] of ofKind(kind).entries()) {
        const entry = sectionOf(page, heading).locator('ul.entries > li').nth(i);
        if (e.points.length === 1) {
          const [pt] = e.points;
          await expect(entry.locator('p', { hasText: pt })).toHaveText(pt);
          await expect(entry.locator('li', { hasText: pt })).toHaveCount(0);
        } else if (e.points.length > 1) {
          await expect(entry.locator('ul.points li')).toHaveText(e.points);
        }
      }
    }
  });

  test('Website links render only for experience with a link, in display order', async ({ page }) => {
    await page.goto('/experience/');
    const expected = [...ofKind('research'), ...ofKind('industry'), ...ofKind('leadership')]
      .map((e) => e.link)
      .filter((l): l is string => Boolean(l));
    const links = page.getByRole('link', { name: 'Website', exact: true });
    await expect(links).toHaveCount(expected.length);
    for (const [i, href] of expected.entries()) await expect(links.nth(i)).toHaveAttribute('href', href);
  });

  test('page text never contains a phone number or a referee', async ({ page }) => {
    await page.goto('/experience/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
    expect(text).not.toMatch(/referee|references/i);
  });
});

test.describe('Achievements page', () => {
  test('has one h1 "Achievements"', async ({ page }) => {
    await page.goto('/achievements/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Achievements');
  });

  test('h2 sections are Awards and Honours then Certificates, each only when it has items', async ({ page }) => {
    await page.goto('/achievements/');
    const expected = [
      ...(awards.length > 0 ? ['Awards and Honours'] : []),
      ...(certificates.length > 0 ? ['Certificates'] : []),
    ];
    await expect(page.locator('h2')).toHaveText(expected);
  });

  test('Awards and Honours has h3 Academic before International, and awards are h4', async ({ page }) => {
    await page.goto('/achievements/');
    const section = sectionOf(page, 'Awards and Honours');
    const groups = [
      ['Academic', academic],
      ['International', international],
    ] as const;
    const expectedGroups = groups.filter(([, items]) => items.length > 0).map(([label]) => label);
    await expect(section.locator('h3')).toHaveText(expectedGroups);
    await expect(section.locator('h4')).toHaveText([...academic, ...international].map((a) => a.title));
  });

  test('certificates are ordered by recency, one line each', async ({ page }) => {
    await page.goto('/achievements/');
    const certs = sectionOf(page, 'Certificates').locator('li');
    await expect(certs).toHaveCount(certsSorted.length);
    for (const [i, c] of certsSorted.entries()) await expect(certs.nth(i)).toContainText(c.title);
  });

  test('page text never contains a phone number or a referee', async ({ page }) => {
    await page.goto('/achievements/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
    expect(text).not.toMatch(/referee|references/i);
  });
});
