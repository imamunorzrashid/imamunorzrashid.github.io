import { describe, expect, test } from 'vitest';
import { z } from 'astro/zod';
import { opt, ym, education, publication, project } from '../../src/lib/schema';

describe('opt', () => {
  test('maps empty string to undefined', () => {
    expect(opt(z.string()).parse('')).toBeUndefined();
  });
  test('keeps real values', () => {
    expect(opt(z.string()).parse('x')).toBe('x');
  });
  test('empty string passes a url schema', () => {
    expect(() => opt(z.url()).parse('')).not.toThrow();
  });
});

describe('ym', () => {
  test('rejects single-digit month', () => {
    expect(ym.safeParse('2023-3').success).toBe(false);
  });
  test('accepts year only', () => {
    expect(ym.safeParse('2023').success).toBe(true);
  });
  test('rejects month 13', () => {
    expect(ym.safeParse('2023-13').success).toBe(false);
  });
  test('rejects month 00', () => {
    expect(ym.safeParse('2023-00').success).toBe(false);
  });
});

describe('project', () => {
  const base = { title: 'T', summary: 'S' };
  test("order '' from the CMS defaults to 100", () => {
    expect(project.parse({ ...base, order: '' }).order).toBe(100);
  });
  test('featured null defaults to false', () => {
    expect(project.parse({ ...base, featured: null }).featured).toBe(false);
  });
  test('image without image_alt fails', () => {
    expect(project.safeParse({ ...base, image: 'a.webp' }).success).toBe(false);
  });
  test('image with image_alt passes', () => {
    expect(project.safeParse({ ...base, image: 'a.webp', image_alt: 'A' }).success).toBe(true);
  });
});

describe('education', () => {
  test('accepts an entry with only end', () => {
    const r = education.safeParse({ degree: 'PhD', institution: 'X', end: '2026-08' });
    expect(r.success).toBe(true);
  });
});

describe('publication', () => {
  const base = { title: 'T', authors: ['A'], venue: 'V', type: 'journal', featured: false };
  test('requires year for published', () => {
    expect(publication.safeParse({ ...base, status: 'published' }).success).toBe(false);
  });
  test('allows missing year for in_preparation', () => {
    expect(publication.safeParse({ ...base, status: 'in_preparation' }).success).toBe(true);
  });
  test('allows missing year for accepted', () => {
    expect(publication.safeParse({ ...base, status: 'accepted' }).success).toBe(true);
  });
});
