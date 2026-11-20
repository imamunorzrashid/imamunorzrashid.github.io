const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatYm(ym: string): string {
  if (ym.length === 4) return ym;
  const month = Number(ym.slice(5, 7));
  return `${MONTHS[month - 1]} ${ym.slice(0, 4)}`;
}

export function formatRange(start: string, end?: string): string {
  if (end === start) return formatYm(start);
  return `${formatYm(start)} – ${end ? formatYm(end) : 'Present'}`;
}

export function ymSortKey(ym?: string): number {
  if (ym === undefined) return Number.POSITIVE_INFINITY;
  const month = ym.length === 7 ? Number(ym.slice(5, 7)) : 0;
  return Number(ym.slice(0, 4)) * 100 + month;
}

type Dated = { start?: string; end?: string };

// Ongoing items (no end) sort first; ties fall back to start, then name. Returns a new array.
export function recentFirst<T extends Dated>(items: T[], name: (t: T) => string): T[] {
  return [...items].sort(
    (a, b) =>
      ymSortKey(b.end) - ymSortKey(a.end) || ymSortKey(b.start) - ymSortKey(a.start) || name(a).localeCompare(name(b)),
  );
}
