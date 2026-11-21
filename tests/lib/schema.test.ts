import { describe, expect, test } from 'vitest';
import { z } from 'astro/zod';
import { opt, ym, education, experience, publication, project, profile, researchPage, teachingPage } from '../../src/lib/schema';

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
  test('image without image_alt fails', () => {
    expect(project.safeParse({ ...base, image: 'a.webp' }).success).toBe(false);
  });
  test('image with image_alt passes', () => {
    expect(project.safeParse({ ...base, image: 'a.webp', image_alt: 'A' }).success).toBe(true);
  });
});

describe('teachingPage course_groups', () => {
  const base = { statement: 'S' };
  test('a group with an empty courses list fails', () => {
    const r = teachingPage.safeParse({ ...base, course_groups: [{ department: 'D', courses: [] }] });
    expect(r.success).toBe(false);
  });
  test('a group with at least one course passes', () => {
    const r = teachingPage.safeParse({ ...base, course_groups: [{ department: 'D', courses: ['C'] }] });
    expect(r.success).toBe(true);
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

describe('publication abstract', () => {
  const base = { title: 'T', authors: ['A'], venue: 'V', type: 'journal', status: 'accepted', featured: false };
  test('an empty abstract from the CMS is treated as missing', () => {
    expect(publication.parse({ ...base, abstract: '' }).abstract).toBeUndefined();
  });
  test('an abstract is kept as written', () => {
    expect(publication.parse({ ...base, abstract: 'Line one.\n\nLine two.' }).abstract).toBe('Line one.\n\nLine two.');
  });
});

describe('profile photo_alt', () => {
  test('an empty photo_alt fails', () => {
    expect(profile.shape.photo_alt.safeParse('').success).toBe(false);
  });
  test('a non-empty photo_alt passes', () => {
    expect(profile.shape.photo_alt.safeParse('Portrait').success).toBe(true);
  });
});

describe('project links', () => {
  const base = { title: 'T', summary: 'S' };
  test('a stale CMS object of links converts to the list', () => {
    expect(project.parse({ ...base, links: { code: 'https://c', paper: '', demo: 'https://d' } }).links).toEqual([
      { label: 'Code', url: 'https://c' },
      { label: 'Demo', url: 'https://d' },
    ]);
  });
  test('a new project defaults to a build with empty lists', () => {
    const p = project.parse(base);
    expect(p.kind).toBe('build');
    expect(p.links).toEqual([]);
    expect(p.images).toEqual([]);
    expect(p.videos).toEqual([]);
    expect(p.tools).toEqual([]);
    expect(p.draft).toBe(false);
  });
  test('an image without alt text fails', () => {
    expect(project.safeParse({ ...base, images: [{ src: '/images/a.webp', alt: '' }] }).success).toBe(false);
  });
  test('an empty video poster from the CMS is treated as missing', () => {
    expect(project.parse({ ...base, videos: [{ url: 'https://youtu.be/x', title: 'Run', poster: '' }] }).videos[0].poster).toBeUndefined();
  });
});

describe('optional images from the CMS', () => {
  test('an empty image object is treated as missing', () => {
    expect(experience.parse({ role: 'R', org: 'O', kind: 'research', start: '2025', image: { src: '', alt: '' } }).image).toBeUndefined();
  });
});

describe('education logo', () => {
  test('an empty logo from the CMS is treated as missing', () => {
    expect(education.parse({ degree: 'D', institution: 'I', logo: '' }).logo).toBeUndefined();
  });
});

describe('research theme story', () => {
  test('an empty story from the CMS is treated as missing', () => {
    const r = researchPage.parse({ statement: 'S', questions: ['Q?'], themes: [{ title: 'T', summary: 'S', story: '' }] });
    expect(r.themes[0].story).toBeUndefined();
  });
});
