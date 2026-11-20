import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { describe, expect, test } from 'vitest';
import * as s from '../src/lib/schema';

const root = fileURLToPath(new URL('..', import.meta.url));

type Field = {
  name: string;
  widget?: string;
  required?: boolean;
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
type Shaped = { shape: Record<string, unknown> };

const config = load(readFileSync(join(root, 'public/admin/config.yml'), 'utf8')) as Config;
const collections = config.collections;
const folderCollections = collections.filter((c) => c.folder);
const fileCollections = collections.filter((c) => c.files);

// Each CMS collection (or file) name mapped to its exported schema in src/lib/schema.ts.
const folderSchemas: Record<string, Shaped> = {
  news: s.news,
  publications: s.publication,
  projects: s.project,
  education: s.education,
  experience: s.experience,
  teaching: s.teaching,
  awards: s.award,
  activities: s.activity,
  certificates: s.certificate,
  gallery: s.gallery,
};
const fileSchemas: Record<string, Shaped> = {
  profile: s.profile,
  research: s.researchPage,
  teaching: s.teachingPage,
};

function topLevelNames(fields: Field[]): string[] {
  return fields.map((f) => f.name).sort();
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

  test('every folder collection has a schema, and its CMS fields are exactly the schema keys', () => {
    for (const c of folderCollections) {
      const schema = folderSchemas[c.name];
      expect(schema, `no schema for ${c.name}`).toBeDefined();
      expect(topLevelNames(c.fields ?? []), c.name).toEqual(Object.keys(schema.shape).sort());
    }
  });

  test('every files entry has a schema, and its CMS fields are exactly the schema keys', () => {
    for (const c of fileCollections) {
      for (const f of c.files ?? []) {
        const schema = fileSchemas[f.name];
        expect(schema, `no schema for ${f.name}`).toBeDefined();
        expect(topLevelNames(f.fields), f.name).toEqual(Object.keys(schema.shape).sort());
      }
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
      const names = topLevelNames(c.fields ?? []);
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
        const names = topLevelNames(f.fields);
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

  test('teaching course_groups is a list of department + courses, both required', () => {
    const teaching = fileCollections.flatMap((c) => c.files ?? []).find((f) => f.name === 'teaching');
    const groups = teaching?.fields.find((f) => f.name === 'course_groups');
    expect(groups?.widget).toBe('list');
    const sub = groups?.fields ?? [];
    expect(sub.map((f) => f.name).sort()).toEqual(['courses', 'department']);
    for (const f of sub) expect(f.required, f.name).not.toBe(false);
  });

  test('every select field lists exactly the options of its schema enum', () => {
    const problems: string[] = [];
    const check = (where: string, fields: Field[], schema: Shaped) => {
      for (const f of walk(fields)) {
        if (f.widget !== 'select') continue;
        const enumField = schema.shape[f.name] as { options?: readonly unknown[] } | undefined;
        const expected = enumField?.options;
        if (!Array.isArray(expected)) {
          problems.push(`${where}.${f.name}: schema field is not an enum`);
          continue;
        }
        const actual = (f.options ?? []).map(String).sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected.map(String).sort())) {
          problems.push(`${where}.${f.name}: ${actual.join(',')} != ${expected.join(',')}`);
        }
      }
    };
    for (const c of folderCollections) check(c.name, c.fields ?? [], folderSchemas[c.name]);
    for (const c of fileCollections) {
      for (const f of c.files ?? []) check(f.name, f.fields, fileSchemas[f.name]);
    }
    expect(problems).toEqual([]);
  });
});
