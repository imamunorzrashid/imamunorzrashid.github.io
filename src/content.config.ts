import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import type { z } from 'astro/zod';
import * as s from './lib/schema';

// Single-object pages use file(): each top-level key is an entry id, so the YAML wraps the page under one key.
const page = (name: string, schema: z.ZodType) =>
  defineCollection({ loader: file(`src/content/pages/${name}.yaml`), schema });

const folder = (dir: string, schema: z.ZodType) =>
  defineCollection({ loader: glob({ pattern: '**/*.yaml', base: `./src/content/${dir}` }), schema });

const profile = page('profile', s.profile);
const researchPage = page('research', s.researchPage);
const teachingPage = page('teaching', s.teachingPage);
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
