import { test, expect, type Page } from '@playwright/test';
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
  skills: { label: string; items: string[] }[];
};
const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as Profile;

type Experience = { role: string; kind: 'research' | 'industry' | 'leadership'; start: string; end?: string; link?: string };
type Education = { degree: string; start?: string; end?: string };
type Award = { title: string; category: 'academic' | 'international'; date: string; end?: string; link?: string };
type Activity = { title: string; date: string; link?: string };
type Certificate = { title: string; date: string };
type Gallery = { caption: string; alt: string; date?: string };

const experience = yamlIn<Experience>('experience');
const education = yamlIn<Education>('education');
const awards = yamlIn<Award>('awards');
const activities = yamlIn<Activity>('activities');
const certificates = yamlIn<Certificate>('certificates');
const gallery = yamlIn<Gallery>('gallery');

// Same comparator as the CV page: ongoing first, then latest end, then latest start, then name.
type Dated = { title?: string; role?: string; degree?: string; start?: string; end?: string };
const name = (d: Dated) => d.title ?? d.role ?? d.degree ?? '';
const recent = <T extends Dated>(items: T[]) =>
  [...items].sort(
    (a, b) =>
      ymSortKey(b.end) - ymSortKey(a.end) || ymSortKey(b.start) - ymSortKey(a.start) || name(a).localeCompare(name(b)),
  );
const awardsDated = awards.map((a) => ({ ...a, start: a.date, end: a.end ?? a.date }));
const certificatesDated = certificates.map((c) => ({ ...c, start: c.date, end: c.date, title: c.title }));
const ofKind = (kind: Experience['kind']) => recent(experience.filter((e) => e.kind === kind));
const academic = recent(awardsDated.filter((a) => a.category === 'academic'));
const international = recent(awardsDated.filter((a) => a.category === 'international'));

const CV_SECTIONS = [
  'Education',
  'Research Experience',
  'Industry Experience',
  'Leadership',
  'Awards and Honours',
  'Talks and Service',
  'Certificates',
  'Technical Skills',
];

const sectionOf = (page: Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });

test.describe('CV page', () => {
  test('has one h1 "CV"', async ({ page }) => {
    await page.goto('/cv/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('CV');
  });

  test('h2 sections are in CV order and appear exactly when they have items', async ({ page }) => {
    await page.goto('/cv/');
    const present: Record<string, boolean> = {
      Education: education.length > 0,
      'Research Experience': ofKind('research').length > 0,
      'Industry Experience': ofKind('industry').length > 0,
      Leadership: ofKind('leadership').length > 0,
      'Awards and Honours': awards.length > 0,
      'Talks and Service': activities.length > 0,
      Certificates: certificates.length > 0,
      'Technical Skills': profile.skills.length > 0,
    };
    const expected = CV_SECTIONS.filter((s) => present[s]);
    await expect(page.locator('h2')).toHaveText(expected);
  });

  test('Awards and Honours has h3 Academic before International, and h3 is not used for awards', async ({ page }) => {
    await page.goto('/cv/');
    const section = sectionOf(page, 'Awards and Honours');
    const groups = [
      ['Academic', academic],
      ['International', international],
    ] as const;
    const expectedGroups = groups.filter(([, items]) => items.length > 0).map(([label]) => label);
    await expect(section.locator('h3')).toHaveText(expectedGroups);
    await expect(section.locator('h4')).toHaveText([...academic, ...international].map((a) => a.title));
  });

  test('entries inside each dated section are ordered by recency', async ({ page }) => {
    await page.goto('/cv/');
    await expect(sectionOf(page, 'Education').locator('h3')).toHaveText(recent(education).map((e) => e.degree));
    await expect(sectionOf(page, 'Research Experience').locator('h3')).toHaveText(ofKind('research').map((e) => e.role));
    await expect(sectionOf(page, 'Industry Experience').locator('h3')).toHaveText(ofKind('industry').map((e) => e.role));
    await expect(sectionOf(page, 'Leadership').locator('h3')).toHaveText(ofKind('leadership').map((e) => e.role));
    const certs = sectionOf(page, 'Certificates').locator('li');
    const expectedCerts = recent(certificatesDated);
    await expect(certs).toHaveCount(expectedCerts.length);
    for (const [i, c] of expectedCerts.entries()) await expect(certs.nth(i)).toContainText(c.title);
  });

  test('page text never contains a phone number or a referee', async ({ page }) => {
    await page.goto('/cv/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('+880');
    expect(text).not.toMatch(/referee|references/i);
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

  test('Website links render only for experience with a link, in display order', async ({ page }) => {
    await page.goto('/cv/');
    const expected = [...ofKind('research'), ...ofKind('industry'), ...ofKind('leadership')]
      .map((e) => e.link)
      .filter((l): l is string => Boolean(l));
    const links = page.getByRole('link', { name: 'Website', exact: true });
    await expect(links).toHaveCount(expected.length);
    for (const [i, href] of expected.entries()) await expect(links.nth(i)).toHaveAttribute('href', href);
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
    const alts = await page.locator('img').evaluateAll((els) => els.map((el) => el.getAttribute('alt') ?? ''));
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
