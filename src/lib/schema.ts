import { z } from 'astro/zod';

// CMS sends '' or null for empty fields; treat them as missing so defaults apply.
export const blank = <T extends z.ZodType>(s: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), s);

export const opt = <T extends z.ZodType>(s: T) => blank(s.optional());

export const ym = z
  .string()
  .regex(/^\d{4}(-\d{2})?$/)
  .refine((v) => v.length === 4 || (Number(v.slice(5)) >= 1 && Number(v.slice(5)) <= 12), {
    message: 'month must be 01–12',
  });

const str = z.string();
const url = z.url();
const bool = blank(z.boolean().default(false));
const list = blank(z.array(z.string()).default([]));

export const profile = z.object({
  name: str,
  pub_name: str,
  title: str,
  affiliation: str,
  location: str,
  email: str,
  photo: str,
  photo_alt: z.string().min(1),
  bio: str,
  seeking: opt(str),
  interests: list,
  links: opt(
    z.object({
      scholar: opt(url),
      orcid: opt(url),
      github: opt(url),
      linkedin: opt(url),
      researchgate: opt(url),
    }),
  ),
  cv_academic: opt(str),
  cv_lecturer: opt(str),
  skills: z.array(z.object({ label: str, items: list })).default([]),
});

export const researchPage = z.object({
  statement: str,
  themes: z.array(z.object({ title: str, summary: str })).default([]),
});

export const teachingPage = z.object({
  statement: str,
  course_groups: z
    .array(z.object({ department: str, courses: z.array(str).min(1) }))
    .default([]),
});

export const news = z.object({
  date: ym,
  text: str,
  link: opt(str),
});

export const publication = z
  .object({
    title: str,
    authors: z.array(str),
    venue: str,
    type: z.enum(['journal', 'conference', 'preprint', 'thesis']),
    status: z.enum(['published', 'accepted', 'under_review', 'in_preparation']),
    year: opt(z.number().int()),
    doi: opt(str),
    url: opt(url),
    pdf: opt(str),
    code: opt(url),
    featured: bool,
    note: opt(str),
    abstract: opt(str),
  })
  .refine((p) => p.status === 'in_preparation' || p.status === 'accepted' || p.year !== undefined, {
    message: 'year required unless status is in_preparation or accepted',
    path: ['year'],
  });

export const project = z
  .object({
    title: str,
    order: blank(z.number().default(100)),
    start: opt(ym),
    end: opt(ym),
    summary: str,
    tags: list,
    links: opt(z.object({ code: opt(url), paper: opt(url), demo: opt(url) })),
    image: opt(str),
    image_alt: opt(str),
    featured: bool,
  })
  .refine((p) => !p.image || !!p.image_alt, {
    message: 'image_alt is required when image is set',
    path: ['image_alt'],
  });

export const education = z.object({
  degree: str,
  institution: str,
  location: opt(str),
  start: opt(ym),
  end: opt(ym),
  thesis_title: opt(str),
  supervisor: opt(str),
  details: list,
});

export const experience = z.object({
  role: str,
  org: str,
  kind: z.enum(['research', 'industry', 'leadership']),
  start: ym,
  end: opt(ym),
  location: opt(str),
  link: opt(url),
  points: list,
});

export const teaching = z.object({
  role: str,
  context: str,
  start: ym,
  end: opt(ym),
  subjects: list,
  level: opt(str),
  description: opt(str),
});

export const award = z.object({
  title: str,
  issuer: str,
  category: z.enum(['academic', 'international']),
  date: ym,
  end: opt(ym),
  description: opt(str),
  link: opt(url),
});

export const activity = z.object({
  title: str,
  kind: z.enum(['talk', 'service', 'reviewing', 'outreach']),
  event: str,
  date: ym,
  location: opt(str),
  link: opt(url),
});

export const certificate = z.object({
  title: str,
  issuer: str,
  date: ym,
  credential_url: opt(url),
});

export const gallery = z.object({
  image: str,
  alt: z.string().min(1),
  caption: str,
  date: opt(ym),
});
