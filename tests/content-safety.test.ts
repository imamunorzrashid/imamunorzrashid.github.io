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

// Referee and phone details must never reach the site.
const forbidden = ['@mte.ruet.ac.bd', '@me.ruet.ac.bd'];

describe('content-safety', () => {
  test('no YAML under src/content contains referee or phone details', () => {
    const hits: string[] = [];
    for (const file of yamlFiles(contentDir)) {
      const text = readFileSync(file, 'utf8');
      for (const needle of forbidden) {
        if (text.includes(needle)) hits.push(`${relative(root, file)} contains "${needle}"`);
      }
    }
    expect(hits).toEqual([]);
  });
});
