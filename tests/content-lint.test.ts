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

// Publication titles are exempt, so publications/ is skipped.
const banned = [
  'passionate', 'cutting-edge', 'leverage', 'leveraging', 'seamless', 'seamlessly', 'delve',
  'spearhead', 'harness the power', 'unlock', 'empower', 'world-class', 'game-changer',
  'synergy', 'tapestry', 'thrilled',
];

describe('content-lint', () => {
  test('editable prose contains no banned phrases', () => {
    const hits: string[] = [];
    for (const file of yamlFiles(contentDir)) {
      const rel = relative(contentDir, file);
      if (rel.startsWith('publications')) continue;
      const text = readFileSync(file, 'utf8').toLowerCase();
      for (const phrase of banned) {
        if (text.includes(phrase)) hits.push(`${relative(root, file)} contains banned phrase "${phrase}"`);
      }
    }
    expect(hits).toEqual([]);
  });
});
