import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src/content');

function yamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return yamlFiles(p);
    return name.endsWith('.yaml') ? [p] : [];
  });
}

// Patterns, not literal numbers, so no real phone number or referee email is stored in this public repo.
const forbidden: { name: string; pattern: RegExp }[] = [
  { name: 'Bangladeshi phone number', pattern: /(?:\+?880[-\s]?)?\b1[3-9]\d{2}-?\d{6}\b/ },
  { name: 'referee email domain', pattern: /@(?:mte|me)\.ruet\.ac\.bd/i },
  { name: 'country code +880', pattern: /\+880/ },
];

describe('content-safety', () => {
  test('no YAML under src/content contains a phone number or referee email', () => {
    const hits: string[] = [];
    for (const file of yamlFiles(contentDir)) {
      const text = readFileSync(file, 'utf8');
      for (const { name, pattern } of forbidden) {
        if (pattern.test(text)) hits.push(`${relative(root, file)} matches ${name}`);
      }
    }
    expect(hits).toEqual([]);
  });

  test('patterns catch fabricated samples of each kind', () => {
    expect(forbidden[0].pattern.test('+880 1999-000000')).toBe(true);
    expect(forbidden[0].pattern.test('1999000000')).toBe(true);
    expect(forbidden[1].pattern.test('0000000000@mte.ruet.ac.bd')).toBe(true);
    expect(forbidden[1].pattern.test('0000000000@me.ruet.ac.bd')).toBe(true);
    expect(forbidden[2].pattern.test('+880 0000')).toBe(true);
  });

  test('patterns ignore DOIs, dates and ordinary numbers', () => {
    const benign = '10.1016/j.ecmx.2026.101896 10.1109/ICM62621.2025.10934771 2026-08 pp. 1–6 1.71% 3.90/4.00';
    for (const { pattern } of forbidden) expect(pattern.test(benign)).toBe(false);
  });
});
