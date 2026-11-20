import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));

type Field = {
  name: string;
  widget?: string;
  fields?: Field[];
  field?: Field;
  media_folder?: string;
  options?: unknown[];
};
type FileEntry = { name: string; file: string; fields: Field[] };
type Collection = {
  name: string;
  folder?: string;
  extension?: string;
  format?: string;
  media_folder?: string;
  files?: FileEntry[];
  fields?: Field[];
};
type Config = { media_folder?: string; collections: Collection[] };

const config = load(readFileSync(join(root, 'public/admin/config.yml'), 'utf8')) as Config;
const collections = config.collections;
const folderCollections = collections.filter((c) => c.folder);
const fileCollections = collections.filter((c) => c.files);

// Expected enums copied from src/lib/schema.ts (zod enums are not easy to read back).
const expectedEnums: Record<string, string[]> = {
  'publications.type': ['journal', 'conference', 'preprint', 'thesis'],
  'publications.status': ['published', 'accepted', 'under_review', 'in_preparation'],
  'experience.kind': ['research', 'industry', 'leadership'],
  'awards.category': ['academic', 'international'],
  'activities.kind': ['talk', 'service', 'reviewing', 'outreach'],
};

function fieldNames(fields: Field[]): string[] {
  return fields.map((f) => f.name);
}

// Walks nested fields (object `fields`, list `fields` or `field`) and yields each field with its widget.
function* walk(fields: Field[]): Generator<Field> {
  for (const f of fields) {
    yield f;
    if (f.fields) yield* walk(f.fields);
    if (f.field) yield* walk([f.field]);
  }
}

function entryFiles(folder: string): string[] {
  return readdirSync(join(root, folder)).filter((n) => n !== '.gitkeep');
}

describe('cms config', () => {
  test('parses and has collections', () => {
    expect(Array.isArray(collections)).toBe(true);
    expect(collections.length).toBeGreaterThan(0);
  });

  test('every folder collection points at an existing folder under src/content/', () => {
    for (const c of folderCollections) {
      expect(c.folder?.startsWith('src/content/'), c.name).toBe(true);
      expect(existsSync(join(root, c.folder as string)), c.folder).toBe(true);
    }
  });

  test('every folder collection uses yaml extension and format', () => {
    for (const c of folderCollections) {
      expect(c.extension, c.name).toBe('yaml');
      expect(c.format, c.name).toBe('yaml');
    }
  });

  test('every file in a folder collection is a .yaml entry (or .gitkeep)', () => {
    const bad: string[] = [];
    for (const c of folderCollections) {
      for (const name of entryFiles(c.folder as string)) {
        if (!name.endsWith('.yaml')) bad.push(`${c.folder}/${name}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('every top-level key of every folder entry is a field of its collection', () => {
    const missing: string[] = [];
    for (const c of folderCollections) {
      const names = fieldNames(c.fields ?? []);
      for (const name of entryFiles(c.folder as string).filter((n) => n.endsWith('.yaml'))) {
        const entry = load(readFileSync(join(root, c.folder as string, name), 'utf8')) as Record<string, unknown>;
        for (const key of Object.keys(entry)) {
          if (!names.includes(key)) missing.push(`${c.name}/${name} -> ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('every file entry exists and every top-level key is a field of that file', () => {
    const problems: string[] = [];
    for (const c of fileCollections) {
      for (const f of c.files ?? []) {
        if (!existsSync(join(root, f.file))) {
          problems.push(`${f.file} missing`);
          continue;
        }
        const data = load(readFileSync(join(root, f.file), 'utf8')) as Record<string, unknown>;
        const names = fieldNames(f.fields);
        for (const key of Object.keys(data)) {
          if (!names.includes(key)) problems.push(`${f.file} -> ${key}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test('every image field has a media_folder, inherited or set', () => {
    const missing: string[] = [];
    const check = (where: string, fields: Field[], inherited: string | undefined) => {
      for (const f of walk(fields)) {
        if (f.widget !== 'image') continue;
        if (!(f.media_folder ?? inherited)) missing.push(`${where}.${f.name}`);
      }
    };
    for (const c of collections) {
      const inherited = c.media_folder ?? config.media_folder;
      if (c.fields) check(c.name, c.fields, inherited);
      for (const f of c.files ?? []) check(`${c.name}/${f.name}`, f.fields, inherited);
    }
    expect(missing).toEqual([]);
  });

  test('every select field uses the schema enum, and no select is unchecked', () => {
    const seen = new Set<string>();
    const problems: string[] = [];
    for (const c of collections) {
      const allFields: [string, Field[]][] = [];
      if (c.fields) allFields.push([c.name, c.fields]);
      for (const f of c.files ?? []) allFields.push([`${c.name}/${f.name}`, f.fields]);
      for (const [where, fields] of allFields) {
        for (const f of walk(fields)) {
          if (f.widget !== 'select') continue;
          const key = `${c.name}.${f.name}`;
          seen.add(key);
          const expected = expectedEnums[key];
          if (!expected) {
            problems.push(`${where}.${f.name}: no expected enum`);
            continue;
          }
          const actual = [...(f.options ?? [])].map(String).sort();
          if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) {
            problems.push(`${key}: ${actual.join(',')} != ${expected.join(',')}`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
    expect([...seen].sort()).toEqual(Object.keys(expectedEnums).sort());
  });
});
