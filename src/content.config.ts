import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import type { z } from 'astro/zod';
import { load } from 'js-yaml';
import * as s from './lib/schema';

// Flat page YAML: the parser wraps the object under the collection name, so the entry id is that name.
const page = <S extends z.ZodType>(path: string, id: string, schema: S) =>
  defineCollection({
    loader: file(path, { parser: (text) => ({ [id]: load(text) as Record<string, unknown> }) }),
    schema,
  });

const folder = <S extends z.ZodType>(dir: string, schema: S) =>
  defineCollection({ loader: glob({ pattern: '**/*.yaml', base: `./src/content/${dir}` }), schema });

const profile = page('src/content/pages/profile.yaml', 'profile', s.profile);
const researchPage = page('src/content/pages/research.yaml', 'researchPage', s.researchPage);
const teachingPage = page('src/content/pages/teaching.yaml', 'teachingPage', s.teachingPage);
const news = folder('news', s.news);
const publications = folder('publications', s.publication);
const projects = folder('projects', s.project);
const education = folder('education', s.education);
const experience = folder('experience', s.experience);
const teaching = folder('teaching', s.teaching);
const awards = folder('awards', s.award);
const activities = folder('activities', s.activity);
const certificates = folder('certificates', s.certificate);
const gallery = folder('gallery', s.gallery);

export const collections = {
  profile,
  researchPage,
  teachingPage,
  news,
  publications,
  projects,
  education,
  experience,
  teaching,
  awards,
  activities,
  certificates,
  gallery,
};
