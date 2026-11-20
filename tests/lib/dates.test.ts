import { describe, expect, test } from 'vitest';
import { formatYm, formatRange, ymSortKey } from '../../src/lib/dates';

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
