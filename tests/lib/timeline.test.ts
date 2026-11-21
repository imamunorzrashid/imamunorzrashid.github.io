import { describe, expect, test } from 'vitest';
import { buildTimeline, type Award, type Education, type Experience, type Pub, type TimelineSource } from '../../src/lib/timeline';

const source = (over: Partial<TimelineSource> = {}): TimelineSource => ({
  education: [],
  experience: [],
  awards: [],
  publications: [],
  stories: [],
  ...over,
});

const edu = (o: Partial<Education>) => ({ degree: 'B.Sc. in EEE', institution: 'RUET', details: [], links: [], ...o }) as Education;
const exp = (o: Partial<Experience>) =>
  ({ role: 'Research Assistant', org: 'Lab', kind: 'research', start: '2024', points: [], links: [], ...o }) as Experience;
const award = (o: Partial<Award>) =>
  ({ title: 'Prize', issuer: 'Board', category: 'academic', date: '2023', ...o }) as Award;
const pub = (o: Partial<Pub>) =>
  ({ title: 'A paper', authors: [], venue: 'Journal', type: 'journal', status: 'published', featured: false, ...o }) as Pub;

describe('buildTimeline', () => {
  test('education dated by end', () => {
    expect(buildTimeline(source({ education: [edu({ degree: 'B.Sc.', end: '2026-08' })] }))).toEqual([
      { year: '2026', items: [{ ym: '2026-08', text: 'B.Sc.', href: '/about/#education' }] },
    ]);
  });

  test('education with only start is dated by start', () => {
    expect(buildTimeline(source({ education: [edu({ degree: 'HSC', start: '2019-03' })] }))).toEqual([
      { year: '2019', items: [{ ym: '2019-03', text: 'HSC', href: '/about/#education' }] },
    ]);
  });

  test('experience text is role, org; dated by start', () => {
    expect(buildTimeline(source({ experience: [exp({ role: 'Engineer', org: 'Team', start: '2025-01' })] }))).toEqual([
      { year: '2025', items: [{ ym: '2025-01', text: 'Engineer, Team', href: '/about/#work' }] },
    ]);
  });

  test('award dated by date', () => {
    expect(buildTimeline(source({ awards: [award({ title: 'Scholarship', date: '2021-06' })] }))).toEqual([
      { year: '2021', items: [{ ym: '2021-06', text: 'Scholarship', href: '/about/#recognition' }] },
    ]);
  });

  test('publication with a year uses the year; without one it is omitted', () => {
    expect(
      buildTimeline(source({ publications: [pub({ title: 'Paper A', year: 2026 }), pub({ title: 'Draft', year: undefined })] })),
    ).toEqual([{ year: '2026', items: [{ ym: '2026', text: 'Paper A', href: '/publications/' }] }]);
  });

  test('story with end and outcome; without end it is omitted', () => {
    expect(
      buildTimeline(
        source({
          stories: [
            { slug: 'fsae', title: 'Electrical system', end: '2025-08', outcome: 'Passed inspection' },
            { slug: 'draft', title: 'Not dated' },
          ],
        }),
      ),
    ).toEqual([
      {
        year: '2025',
        items: [{ ym: '2025-08', text: 'Electrical system: Passed inspection', href: '/projects/fsae/' }],
      },
    ]);
  });

  test('story without outcome uses the title alone', () => {
    expect(buildTimeline(source({ stories: [{ slug: 's', title: 'Title', end: '2024' }] }))).toEqual([
      { year: '2024', items: [{ ym: '2024', text: 'Title', href: '/projects/s/' }] },
    ]);
  });

  test('years are descending, items within a year are by ym descending, ties keep source order', () => {
    const result = buildTimeline(
      source({
        education: [edu({ degree: 'Edu 2026-01', end: '2026-01' })],
        experience: [exp({ role: 'Exp', org: 'Org', start: '2026-05' })],
        awards: [award({ title: 'Award 2026-05', date: '2026-05' }), award({ title: 'Award 2025', date: '2025' })],
        publications: [pub({ title: 'Pub 2026', year: 2026 })],
      }),
    );
    expect(result).toEqual([
      {
        year: '2026',
        items: [
          { ym: '2026-05', text: 'Exp, Org', href: '/about/#work' },
          { ym: '2026-05', text: 'Award 2026-05', href: '/about/#recognition' },
          { ym: '2026-01', text: 'Edu 2026-01', href: '/about/#education' },
          { ym: '2026', text: 'Pub 2026', href: '/publications/' },
        ],
      },
      { year: '2025', items: [{ ym: '2025', text: 'Award 2025', href: '/about/#recognition' }] },
    ]);
  });

  test('empty source gives an empty timeline', () => {
    expect(buildTimeline(source())).toEqual([]);
  });
});
