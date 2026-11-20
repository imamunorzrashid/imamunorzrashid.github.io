import { describe, expect, test } from 'vitest';
import { groupPublications, splitAuthors } from '../../src/lib/pubs';
import type { Pub } from '../../src/lib/pubs';

const p = (o: Partial<Pub>): Pub => ({
  title: 'Untitled',
  authors: [],
  venue: 'V',
  type: 'journal',
  status: 'published',
  featured: false,
  ...o,
} as Pub);

describe('groupPublications', () => {
  test('groups, orders and labels', () => {
    const pubs: Pub[] = [
      p({ title: 'a', type: 'journal', status: 'published', year: 2025 }),
      p({ title: 'b', type: 'conference', status: 'published', year: 2024 }),
      p({ title: 'c', type: 'journal', status: 'accepted', year: 2026 }),
      p({ title: 'd', type: 'journal', status: 'under_review' }),
      p({ title: 'e', type: 'journal', status: 'in_preparation' }),
      p({ title: 'f', type: 'journal', status: 'published', year: 2023 }),
    ];
    const groups = groupPublications(pubs);
    expect(groups.map((g) => g.key)).toEqual([
      'journal',
      'conference',
      'accepted',
      'under_review',
      'in_preparation',
    ]);
    expect(groups.map((g) => g.label)).toEqual([
      'Journal Articles',
      'Conference Papers',
      'Accepted',
      'Under Review',
      'In Preparation',
    ]);
    expect(groups.map((g) => g.prefix)).toEqual(['J', 'C', 'S', 'U', 'P']);
    expect(groups[0].items.map((i) => i.title)).toEqual(['a', 'f']);
  });

  test('accepted journal lands in accepted, not journal', () => {
    const groups = groupPublications([p({ title: 'c', type: 'journal', status: 'accepted' })]);
    expect(groups.map((g) => g.key)).toEqual(['accepted']);
  });

  test('missing year sorts last, then by title', () => {
    const groups = groupPublications([
      p({ title: 'z', status: 'published', year: 2020 }),
      p({ title: 'b', status: 'published' }),
      p({ title: 'a', status: 'published' }),
    ]);
    expect(groups[0].items.map((i) => i.title)).toEqual(['z', 'a', 'b']);
  });
});

describe('splitAuthors', () => {
  test('marks self ignoring dots, spaces and case', () => {
    expect(splitAuthors(['M. O. Rashid', 'S. K. Sarker'], 'M.O. Rashid')).toEqual([
      { name: 'M. O. Rashid', self: true },
      { name: 'S. K. Sarker', self: false },
    ]);
  });
});
