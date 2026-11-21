import { test, expect, type Page } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { formatRange, recentFirst } from '../../src/lib/dates';
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
type Education = {
  degree: string;
  institution: string;
  start?: string;
  end?: string;
  logo?: string;
  story?: string;
  thesis_title?: string;
  details: string[];
  hidden?: boolean;
};
type Award = {
  title: string;
  issuer: string;
  category: string;
  date: string;
  end?: string;
  description?: string;
  link?: string;
  story?: string;
  logo?: string;
};
type Activity = { title: string; date: string; video?: string; images?: { src: string; alt: string }[] };
type Certificate = { title: string; date: string };
type Publication = { title: string; year?: number | null };
type Project = { title: string; story?: string; draft?: boolean; end?: string; outcome?: string };

const experience = yamlIn<Experience>('experience');
const education = yamlIn<Education>('education');
// Hidden entries (hidden: true) stay in the content but are not shown on About.
const shownEducation = education.filter((e) => !e.hidden);
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
// Work groups: undergraduate research first, then leadership and attachment (leadership and industry).
const workGroups = [
  { label: 'Undergraduate research', items: work.filter((e) => e.kind === 'research') },
  { label: 'Leadership and attachment', items: work.filter((e) => e.kind !== 'research') },
].filter((g) => g.items.length > 0);
const workOrder = workGroups.flatMap((g) => g.items);

const eduSorted = recentFirst(shownEducation, (e) => e.degree);
const awardsDated = awards.map((a) => ({ ...a, start: a.date, end: a.end ?? a.date }));
const awardsSorted = recentFirst(awardsDated, (a) => a.title);
// Recognition groups: academic first, then international.
const awardGroups = [
  { label: 'Academic achievements', items: awardsSorted.filter((a) => a.category === 'academic') },
  { label: 'International achievements', items: awardsSorted.filter((a) => a.category === 'international') },
].filter((g) => g.items.length > 0);
const awardOrder = awardGroups.flatMap((g) => g.items);
const activitiesSorted = recentFirst(
  activities.map((a) => ({ ...a, start: a.date, end: a.date })),
  (a) => a.title,
);
const certsSorted = recentFirst(
  certificates.map((c) => ({ ...c, start: c.date, end: c.date })),
  (c) => c.title,
);
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

  test('h2 sections are in order, each appears only when it has items, and there is no Skills section', async ({ page }) => {
    await page.goto('/about/');
    const expected = [
      ...(timeline.length > 0 ? ['Timeline'] : []),
      ...(eduSorted.length > 0 ? ['Education'] : []),
      ...(experience.length > 0 ? ['Work'] : []),
      ...(awards.length > 0 || certificates.length > 0 ? ['Recognition'] : []),
      ...(activities.length > 0 ? ['Talks and service'] : []),
    ];
    await expect(page.locator('h2')).toHaveText(expected);
    await expect(page.locator('#skills')).toHaveCount(0);
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

  test('timeline lines have no underline and an icon beside the title', async ({ page }) => {
    test.skip(timeline.length === 0, 'no dated items yet');
    await page.goto('/about/');
    const links = sectionOf(page, 'Timeline').locator('a');
    for (const i of timelineLines.keys()) {
      await expect(links.nth(i).locator(':scope > svg')).toHaveCount(1);
      expect(await links.nth(i).evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
    }
  });

  test('timeline lines use the chain icon, since every timeline link is internal', async ({ page }) => {
    test.skip(timeline.length === 0, 'no dated items yet');
    const src = readFileSync(new URL('../../src/components/LinkIcon.astro', import.meta.url), 'utf8');
    const chain = src.match(/chain:\s*'([^']+)'/)?.[1];
    expect(chain).toBeTruthy();
    await page.goto('/about/');
    const links = sectionOf(page, 'Timeline').locator('a');
    for (const i of timelineLines.keys()) {
      await expect(links.nth(i).locator('svg path')).toHaveAttribute('d', chain!);
    }
  });

  test('education entries are ordered by recency', async ({ page }) => {
    await page.goto('/about/');
    // Compact entries have no h3, so check each item (full or compact) in order.
    const items = sectionOf(page, 'Education').locator('.item');
    await expect(items).toHaveCount(eduSorted.length);
    for (const [i, e] of eduSorted.entries()) await expect(items.nth(i)).toContainText(e.degree);
  });

  test('HSC and SSC are hidden on About, and their data stays in the content', async ({ page }) => {
    await page.goto('/about/');
    for (const degree of [/Higher Secondary Certificate/, /Secondary School Certificate/]) {
      const e = education.find((x) => degree.test(x.degree));
      expect(e, `education entry matching ${degree}`).toBeDefined();
      expect(e!.hidden, e!.degree).toBe(true);
      await expect(page.locator('body')).not.toContainText(e!.degree);
      await expect(page.locator('body')).not.toContainText(e!.institution);
    }
  });

  test('the B.Sc. keeps the full layout, with a heading and its thesis', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Education');
    const bsc = education.find((x) => /B\.Sc\./.test(x.degree));
    expect(bsc, 'B.Sc. entry').toBeDefined();
    const entry = section.locator('.entry', { hasText: bsc!.degree });
    await expect(entry.locator('h3')).toHaveText(bsc!.degree);
    await expect(entry).toContainText(bsc!.thesis_title!);
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
    for (const e of shownEducation) {
      if (!e.story || !e.thesis_title) continue;
      await expect(sectionOf(page, 'Education').locator(`a[href="/projects/${e.story}/"]`)).toHaveCount(1);
    }
  });

  test('work is grouped: undergraduate research first, then leadership and attachment, newest first in each', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Work');
    await expect(section.locator('h3')).toHaveText(workGroups.flatMap((g) => [g.label, ...g.items.map((e) => e.role)]));
  });

  test('work entries render points as paragraphs, never list items', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Work');
    await expect(section.locator('li')).toHaveCount(0);
    for (const [i, e] of workOrder.entries()) {
      const entry = section.locator('.entry').nth(i);
      for (const pt of e.points) {
        await expect(entry.locator('p', { hasText: pt })).toHaveCount(1);
      }
    }
  });

  test('Website and other work links render in display order, one per link', async ({ page }) => {
    await page.goto('/about/');
    const expected = workOrder.flatMap(linksOf);
    // Only the meta-line links: Figure wraps every image in an anchor too.
    const links = sectionOf(page, 'Work').locator('.meta a');
    await expect(links).toHaveCount(expected.length);
    for (const [i, l] of expected.entries()) {
      await expect(links.nth(i)).toHaveText(l.label);
      await expect(links.nth(i)).toHaveAttribute('href', l.url);
    }
  });

  test('awards are in two groups, academic then international, each showing title (with icon when linked), year and issuer', async ({ page }) => {
    await page.goto('/about/');
    const section = sectionOf(page, 'Recognition');
    await expect(section.locator('h3')).toHaveText([
      ...awardGroups.map((g) => g.label),
      ...(certificates.length > 0 ? ['Certificates'] : []),
    ]);
    const items = section.locator('.award');
    await expect(items).toHaveCount(awardOrder.length);
    for (const [i, a] of awardOrder.entries()) {
      const item = items.nth(i);
      await expect(item.locator('.award-title')).toHaveText(a.title);
      await expect(item.locator('.year')).toHaveText(formatRange(a.date, a.end ?? a.date));
      // Line 2 is the issuer, the first .meta in the item.
      await expect(item.locator('.meta').first()).toHaveText(a.issuer);
      if (a.description) await expect(item).not.toContainText(a.description);
      await expect(item.locator('.award-title svg')).toHaveCount(a.link ? 1 : 0);
      if (a.link) await expect(item.locator('.award-title a')).toHaveAttribute('href', a.link);
      await expect(item.locator('img[alt=""]')).toHaveCount(a.logo ? 1 : 0);
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
    await expect(section.locator('h3')).toHaveText([...awardGroups.map((g) => g.label), 'Certificates']);
    const certs = section.locator('ul.certs li');
    await expect(certs).toHaveCount(certsSorted.length);
    for (const [i, c] of certsSorted.entries()) await expect(certs.nth(i)).toContainText(c.title);
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

  test('the EV-motors talk shows its photo under the talk line', async ({ page }) => {
    await page.goto('/about/');
    const talk = sectionOf(page, 'Talks and service').locator('.item', { hasText: 'Driving Innovation' });
    await expect(talk.locator('figure')).toHaveCount(1);
    await expect(talk.locator('figure img')).toHaveAttribute('src', '/images/activities/seminar.jpg');
    await expect(talk.locator('figure img')).toHaveAttribute('alt', /EV Powertrain/);
  });

  test('talk photos render one figure per image, and talks without photos render none', async ({ page }) => {
    await page.goto('/about/');
    const items = sectionOf(page, 'Talks and service').locator('.item');
    for (const [i, a] of activitiesSorted.entries()) {
      const figures = items.nth(i).locator('figure');
      await expect(figures).toHaveCount(a.images?.length ?? 0);
      for (const [j, img] of (a.images ?? []).entries()) {
        await expect(figures.nth(j).locator('img')).toHaveAttribute('src', img.src);
        await expect(figures.nth(j).locator('img')).toHaveAttribute('alt', img.alt);
      }
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
