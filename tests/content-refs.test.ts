import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { load } from 'js-yaml';

const contentDir = join(fileURLToPath(new URL('..', import.meta.url)), 'src/content');

const yamlIn = (dir: string) =>
  readdirSync(join(contentDir, dir))
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => ({ slug: f.replace(/\.yaml$/, ''), data: load(readFileSync(join(contentDir, dir, f), 'utf8')) as Record<string, any> }));

describe('story references', () => {
  const storySlugs = new Set(yamlIn('projects').filter((p) => p.data.story).map((p) => p.slug));
  const research = load(readFileSync(join(contentDir, 'pages/research.yaml'), 'utf8')) as { themes?: { title: string; story?: string }[] };

  const refs = [
    ...yamlIn('education').map((e) => ({ where: `education/${e.slug}`, story: e.data.story })),
    ...yamlIn('awards').map((a) => ({ where: `awards/${a.slug}`, story: a.data.story })),
    ...(research.themes ?? []).map((t) => ({ where: `research theme "${t.title}"`, story: t.story })),
  ];

  test('every story value names a project with a non-empty story', () => {
    const broken = refs.filter((r) => r.story && !storySlugs.has(r.story)).map((r) => `${r.where} -> ${r.story}`);
    expect(broken).toEqual([]);
  });
});
