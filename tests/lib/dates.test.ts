import { describe, expect, test } from 'vitest';
import { formatYm, formatRange, recentFirst, ymSortKey } from '../../src/lib/dates';

describe('dates', () => {
  test('formatYm month', () => {
    expect(formatYm('2023-03')).toBe('Mar 2023');
  });
  test('formatYm year', () => {
    expect(formatYm('2023')).toBe('2023');
  });
  test('formatRange open-ended uses Present', () => {
    expect(formatRange('2021-03')).toBe('Mar 2021 – Present');
  });
  test('formatRange with end', () => {
    expect(formatRange('2021', '2025')).toBe('2021 – 2025');
  });
  test('formatRange collapses a same-value range to one date', () => {
    expect(formatRange('2026', '2026')).toBe('2026');
    expect(formatRange('2023-03', '2023-03')).toBe('Mar 2023');
  });
  test('ymSortKey orders months and years', () => {
    expect(ymSortKey('2023-03')).toBe(202303);
    expect(ymSortKey('2023')).toBe(202300);
  });
  test('ymSortKey puts undefined (ongoing) first in descending order', () => {
    expect(ymSortKey(undefined)).toBeGreaterThan(ymSortKey('2099-12'));
  });
});

describe('recentFirst', () => {
  const name = (t: { name: string }) => t.name;
  test('ongoing items come first, then latest end, then latest start, then name', () => {
    const items = [
      { name: 'B', start: '2020', end: '2022' },
      { name: 'A', start: '2019', end: '2022' },
      { name: 'C', start: '2021' },
      { name: 'D', start: '2018', end: '2023' },
    ];
    expect(recentFirst(items, name).map((i) => i.name)).toEqual(['C', 'D', 'B', 'A']);
  });
  test('equal dates fall back to name, ascending', () => {
    const items = [
      { name: 'Zeta', start: '2021', end: '2021' },
      { name: 'Alpha', start: '2021', end: '2021' },
    ];
    expect(recentFirst(items, name).map((i) => i.name)).toEqual(['Alpha', 'Zeta']);
  });
  test('does not mutate its input', () => {
    const items = [
      { name: 'B', start: '2020' },
      { name: 'A', start: '2021' },
    ];
    recentFirst(items, name);
    expect(items.map((i) => i.name)).toEqual(['B', 'A']);
  });
});
