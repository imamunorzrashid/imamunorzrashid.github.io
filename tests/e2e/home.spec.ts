import { test, expect } from './fixtures';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'js-yaml';
import { formatYm, ymSortKey } from '../../src/lib/dates';

const profile = load(readFileSync(new URL('../../src/content/pages/profile.yaml', import.meta.url), 'utf8')) as {
  name: string;
  email: string;
  cv_academic?: string;
  links: { scholar: string; researchgate?: string };
  flag_counter?: string;
  now?: string;
  now_date?: string;
  audience_line?: string;
};

const yamlIn = <T>(dir: URL) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => ({ slug: f.replace(/\.yaml$/, ''), ...(load(readFileSync(new URL(f, dir), 'utf8')) as T) }));

const featuredPubs = yamlIn<{ title: string; featured?: boolean }>(new URL('../../src/content/publications/', import.meta.url)).filter(
  (p) => p.featured,
);
const newsItems = yamlIn<{ date: string; text: string }>(new URL('../../src/content/news/', import.meta.url))
  .sort((a, b) => ymSortKey(b.date) - ymSortKey(a.date))
  .slice(0, 5);

const sectionOf = (page: import('@playwright/test').Page, heading: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });

// Optional links appear only when the profile sets them.
const researchGate = profile.links.researchgate ? ['ResearchGate'] : [];
const academicCv = profile.cv_academic ? ['Academic CV'] : [];
const homeLabels = ['Email', 'Google Scholar', 'ORCID', ...researchGate, 'GitHub', 'LinkedIn', ...academicCv];
const footerLabels = [profile.email, 'Google Scholar', 'ORCID', ...researchGate, 'GitHub', 'LinkedIn', 'Gallery'];

test('home has exactly one h1 with the profile name', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText(profile.name);
});

test('header nav has the five main links in order', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav a')).toHaveText(['Research', 'Projects', 'Publications', 'About', 'CV']);
});

test('at 1280px the nav is one row, level with the site name', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tops = await page.locator('header nav a').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(tops).toHaveLength(5);
  for (const y of tops) expect(Math.abs(y - tops[0])).toBeLessThan(1);
  const nameTop = await page.locator('header .site-name').evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(nameTop - tops[0])).toBeLessThan(8);
});

test('home does not scroll horizontally at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(375);
});

const redirects: [string, RegExp][] = [
  ['#research', /\/research\/$/],
  ['#publications', /\/publications\/$/],
  ['#projects', /\/projects\/$/],
  ['#gallery', /\/gallery\/$/],
  ['#education', /\/about\/#education$/],
  ['#leadership', /\/about\/#work$/],
  ['#industry', /\/about\/#work$/],
  ['#honors', /\/about\/#recognition$/],
  ['#certifications', /\/about\/#recognition$/],
];

for (const [hash, target] of redirects) {
  test(`/${hash} redirects to its page`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page).toHaveURL(target);
  });
}

for (const hash of ['#home', '#contact']) {
  test(`/${hash} stays on the home page`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page).toHaveURL(new RegExp(`/${hash}$`));
    expect(new URL(page.url()).pathname).toBe('/');
  });
}

test('footer shows the last updated line', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('Last updated');
});

test('home links row: each link shows an aria-hidden icon before its text label', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('.text-links').first();
  await expect(row.locator('a')).toHaveText(homeLabels);
  const links = row.locator('a');
  const count = await links.count();
  for (let i = 0; i < count; i++) {
    const a = links.nth(i);
    await expect(a.locator(':scope > svg')).toHaveCount(1);
    await expect(a.locator(':scope > svg')).toHaveAttribute('aria-hidden', 'true');
    expect(await a.evaluate((el) => el.firstElementChild?.tagName.toLowerCase())).toBe('svg');
  }
});

test('home links row: accessible names equal the text labels and hrefs match the profile', async ({ page }) => {
  await page.goto('/');
  const link = (name: string) => page.locator('.text-links').first().getByRole('link', { name, exact: true });
  if (profile.links.researchgate) await expect(link('ResearchGate')).toHaveAttribute('href', profile.links.researchgate);
  if (profile.cv_academic) await expect(link('Academic CV')).toHaveAttribute('href', profile.cv_academic);
  await expect(link('Google Scholar')).toHaveAttribute('href', profile.links.scholar);
});

test('home links row and footer first paragraph: each accessible name equals its trimmed visible text', async ({ page }) => {
  await page.goto('/');
  const groups = [
    page.locator('.text-links').first().locator('a'),
    page.locator('footer > p').first().locator('a'),
  ];
  for (const group of groups) {
    const count = await group.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const a = group.nth(i);
      await expect(a).toHaveAccessibleName((await a.innerText()).trim());
    }
  }
});

test('link rows keep a non-breaking space before each separator dot', async ({ page }) => {
  await page.goto('/');
  for (const row of [page.locator('.text-links').first(), page.locator('footer > p').first()]) {
    if ((await row.locator('a').count()) < 2) continue;
    expect(await row.evaluate((el) => el.textContent ?? '')).toContain(' ·');
  }
});

test('footer links: icons on social links, ResearchGate listed, Gallery has no icon', async ({ page }) => {
  await page.goto('/');
  const footerLinksLocator = page.locator('footer > p').first().locator('a');
  await expect(footerLinksLocator).toHaveText(footerLabels);
  const count = await footerLinksLocator.count();
  for (let i = 0; i < count; i++) {
    const a = footerLinksLocator.nth(i);
    const hasIcon = (await a.locator(':scope > svg').count()) === 1;
    expect(hasIcon, await a.innerText()).toBe(i < count - 1);
    if (hasIcon) await expect(a.locator(':scope > svg')).toHaveAttribute('aria-hidden', 'true');
  }
});

test('footer Academic CV is absent', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer').getByRole('link', { name: 'Academic CV' })).toHaveCount(0);
});

test('body uses Source Serif 4', async ({ page }) => {
  await page.goto('/');
  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toContain('Source Serif 4 Variable');
});

test('footer shows the Flag Counter after the last updated line iff flag_counter is set', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  if (!profile.flag_counter) {
    await expect(footer.locator('a[href*="flagcounter.com"]')).toHaveCount(0);
    return;
  }
  const counter = footer.locator(`a[href="https://info.flagcounter.com/${profile.flag_counter}"]`);
  await expect(counter).toHaveCount(1);
  const img = counter.locator('img');
  await expect(img).toHaveCount(1);
  await expect(img).toHaveAttribute('alt', /\S/);
  await expect(counter).toHaveAttribute('rel', 'noopener');
  const previous = await counter.evaluate((el) => el.closest('p')?.previousElementSibling?.textContent ?? '');
  expect(previous).toContain('Last updated');
});

test('Now heading appears only when now is set; "As of" sits under it when now_date is set', async ({ page }) => {
  await page.goto('/');
  const section = sectionOf(page, 'Now');
  if (!profile.now) {
    await expect(section).toHaveCount(0);
    return;
  }
  await expect(section).toHaveCount(1);
  if (profile.now_date) {
    await expect(section.locator('h2 + p')).toHaveText(`As of ${formatYm(profile.now_date)}`);
  } else {
    await expect(section.getByText('As of')).toHaveCount(0);
  }
});

test('audience line renders only when audience_line is set', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.audience')).toHaveCount(profile.audience_line ? 1 : 0);
});

test('home has no Selected work section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Selected work' })).toHaveCount(0);
});

test('featured publications do not appear on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Selected Publications' })).toHaveCount(0);
  // News repeats one paper's title, so the check skips the News section.
  const outsideNews = page
    .locator('main section')
    .filter({ hasNot: page.getByRole('heading', { name: 'News', exact: true }) });
  for (const pub of featuredPubs) {
    await expect(outsideNews.getByText(pub.title)).toHaveCount(0);
  }
});

test('News shows the latest five items, newest first, with their dates', async ({ page }) => {
  await page.goto('/');
  const section = sectionOf(page, 'News');
  if (newsItems.length === 0) {
    await expect(section).toHaveCount(0);
    return;
  }
  await expect(section).toHaveCount(1);
  const items = section.locator('li');
  await expect(items).toHaveCount(newsItems.length);
  for (const [i, n] of newsItems.entries()) {
    await expect(items.nth(i).locator('.meta')).toHaveText(formatYm(n.date));
  }
});
