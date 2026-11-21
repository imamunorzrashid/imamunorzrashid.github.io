import type { z } from 'astro/zod';
import type { award, education, experience, publication } from './schema';
import { ymSortKey } from './dates';

export type Education = z.infer<typeof education>;
export type Experience = z.infer<typeof experience>;
export type Award = z.infer<typeof award>;
export type Pub = z.infer<typeof publication>;

export type TimelineItem = { ym: string; text: string; href: string };
export type TimelineSource = {
  education: Education[];
  experience: Experience[];
  awards: Award[];
  publications: Pub[];
  stories: { slug: string; title: string; end?: string; outcome?: string }[];
};

// Items without a date are left out.
const dated = (ym: string | undefined, text: string, href: string): TimelineItem[] => (ym ? [{ ym, text, href }] : []);

// Years newest first; within a year, newest first, ties in source order.
export function buildTimeline(src: TimelineSource): { year: string; items: TimelineItem[] }[] {
  const items: TimelineItem[] = [
    ...src.education.flatMap((e) => dated(e.end ?? e.start, e.degree, '/about/#education')),
    ...src.experience.flatMap((x) => dated(x.start, `${x.role}, ${x.org}`, '/about/#work')),
    ...src.awards.flatMap((a) => dated(a.date, a.title, '/about/#recognition')),
    ...src.publications.flatMap((p) => dated(p.year === undefined ? undefined : String(p.year), p.title, '/publications/')),
    ...src.stories.flatMap((s) =>
      dated(s.end, s.outcome ? `${s.title}: ${s.outcome}` : s.title, `/projects/${s.slug}/`),
    ),
  ];
  const years = [...new Set(items.map((i) => i.ym.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  return years.map((year) => ({
    year,
    items: items.filter((i) => i.ym.startsWith(year)).sort((a, b) => ymSortKey(b.ym) - ymSortKey(a.ym)),
  }));
}
