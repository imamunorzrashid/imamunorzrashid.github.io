import type { z } from 'astro/zod';
import type { publication } from './schema';

export type Pub = z.infer<typeof publication>;

export type PubGroupKey = 'journal' | 'conference' | 'accepted' | 'under_review' | 'in_preparation';

const GROUPS: { key: PubGroupKey; label: string; prefix: 'J' | 'C' | 'S' | 'U' | 'P' }[] = [
  { key: 'journal', label: 'Journal Articles', prefix: 'J' },
  { key: 'conference', label: 'Conference Papers', prefix: 'C' },
  { key: 'accepted', label: 'Accepted', prefix: 'S' },
  { key: 'under_review', label: 'Under Review', prefix: 'U' },
  { key: 'in_preparation', label: 'In Preparation', prefix: 'P' },
];

function groupKey(p: Pub): PubGroupKey {
  if (p.status === 'accepted') return 'accepted';
  if (p.status === 'under_review') return 'under_review';
  if (p.status === 'in_preparation') return 'in_preparation';
  return p.type === 'journal' ? 'journal' : 'conference';
}

// Year descending, missing year last, then title.
function byYearThenTitle(a: Pub, b: Pub): number {
  if (a.year === undefined || b.year === undefined) {
    if (a.year === b.year) return a.title.localeCompare(b.title);
    return a.year === undefined ? 1 : -1;
  }
  return b.year - a.year || a.title.localeCompare(b.title);
}

export function groupPublications(pubs: Pub[]) {
  return GROUPS.map((g) => ({
    ...g,
    items: pubs.filter((p) => groupKey(p) === g.key).sort(byYearThenTitle),
  })).filter((g) => g.items.length > 0);
}

// Ignores dots, spaces and case: "M. O. Rashid" matches "M.O. Rashid".
const norm = (s: string) => s.replace(/[.\s]/g, '').toLowerCase();

export function splitAuthors(authors: string[], self: string): { name: string; self: boolean }[] {
  const me = norm(self);
  return authors.map((name) => ({ name, self: norm(name) === me }));
}
