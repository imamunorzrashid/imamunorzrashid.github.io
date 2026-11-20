const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatYm(ym: string): string {
  if (ym.length === 4) return ym;
  const month = Number(ym.slice(5, 7));
  return `${MONTHS[month - 1]} ${ym.slice(0, 4)}`;
}

export function formatRange(start: string, end?: string): string {
  return `${formatYm(start)} – ${end ? formatYm(end) : 'Present'}`;
}

export function ymSortKey(ym?: string): number {
  if (ym === undefined) return Number.POSITIVE_INFINITY;
  const month = ym.length === 7 ? Number(ym.slice(5, 7)) : 0;
  return Number(ym.slice(0, 4)) * 100 + month;
}
