import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { load } from 'js-yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src/content');
const publicDir = join(root, 'public');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('content-assets', () => {
  test('every /images/, /cv/ or /docs/ path in YAML exists under public/', () => {
    const missing: string[] = [];
    for (const file of walk(contentDir).filter((f) => f.endsWith('.yaml'))) {
      for (const s of strings(load(readFileSync(file, 'utf8')))) {
        if (!(s.startsWith('/images/') || s.startsWith('/cv/') || s.startsWith('/docs/'))) continue;
        if (!existsSync(join(publicDir, s))) missing.push(`${relative(root, file)} -> ${s}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('every file under public/images/ is at most 500 KB and kebab-case (logos may also be png or svg)', () => {
    const imagesDir = join(publicDir, 'images');
    const logosDir = join(imagesDir, 'logos') + sep;
    const files = existsSync(imagesDir) ? walk(imagesDir).filter((f) => basename(f) !== '.gitkeep') : [];
    const problems: string[] = [];
    for (const f of files) {
      const name = basename(f);
      const rel = relative(root, f);
      const pattern = f.startsWith(logosDir) ? /^[a-z0-9-]+\.(webp|jpg|png|svg)$/ : /^[a-z0-9-]+\.(webp|jpg)$/;
      if (!pattern.test(name)) problems.push(`${rel}: name is not kebab-case webp/jpg`);
      if (statSync(f).size > 500 * 1024) problems.push(`${rel}: over 500 KB`);
    }
    expect(problems).toEqual([]);
  });

  test('every file under public/docs/ is a kebab-case pdf of at most 10 MB', () => {
    const docsDir = join(publicDir, 'docs');
    const files = existsSync(docsDir) ? walk(docsDir).filter((f) => basename(f) !== '.gitkeep') : [];
    const problems: string[] = [];
    for (const f of files) {
      const rel = relative(root, f);
      if (!/^[a-z0-9-]+\.pdf$/.test(basename(f))) problems.push(`${rel}: name is not kebab-case pdf`);
      if (statSync(f).size > 10 * 1024 * 1024) problems.push(`${rel}: over 10 MB`);
    }
    expect(problems).toEqual([]);
  });
});
