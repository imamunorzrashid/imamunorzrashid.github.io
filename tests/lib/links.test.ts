import { describe, expect, test } from 'vitest';
import { footerLinks, homeLinks } from '../../src/lib/links';

const full = {
  email: 'someone@example.org',
  links: {
    scholar: 'https://scholar.example/s',
    orcid: 'https://orcid.example/o',
    github: 'https://github.example/g',
    linkedin: 'https://linkedin.example/l',
    researchgate: 'https://researchgate.example/r',
  },
  cv_academic: 'https://cv.example/academic',
};

describe('homeLinks', () => {
  test('lists every link in order, each with its icon, when all are set', () => {
    expect(homeLinks(full)).toEqual([
      { label: 'Email', href: 'mailto:someone@example.org', icon: 'email' },
      { label: 'Google Scholar', href: 'https://scholar.example/s', icon: 'scholar' },
      { label: 'ORCID', href: 'https://orcid.example/o', icon: 'orcid' },
      { label: 'ResearchGate', href: 'https://researchgate.example/r', icon: 'researchgate' },
      { label: 'GitHub', href: 'https://github.example/g', icon: 'github' },
      { label: 'LinkedIn', href: 'https://linkedin.example/l', icon: 'linkedin' },
      { label: 'Academic CV', href: 'https://cv.example/academic', icon: 'cv' },
    ]);
  });

  test('omits every social link and the CV that is not set', () => {
    expect(homeLinks({ email: 'a@b.c' })).toEqual([{ label: 'Email', href: 'mailto:a@b.c', icon: 'email' }]);
  });

  test('treats an empty CV link as not set', () => {
    const labels = homeLinks({ ...full, cv_academic: '' }).map((l) => l.label);
    expect(labels).not.toContain('Academic CV');
  });
});

describe('footerLinks', () => {
  test('lists email, Scholar, ORCID, ResearchGate, GitHub, LinkedIn, then Gallery without an icon', () => {
    expect(footerLinks(full)).toEqual([
      { label: 'someone@example.org', href: 'mailto:someone@example.org', icon: 'email' },
      { label: 'Google Scholar', href: 'https://scholar.example/s', icon: 'scholar' },
      { label: 'ORCID', href: 'https://orcid.example/o', icon: 'orcid' },
      { label: 'ResearchGate', href: 'https://researchgate.example/r', icon: 'researchgate' },
      { label: 'GitHub', href: 'https://github.example/g', icon: 'github' },
      { label: 'LinkedIn', href: 'https://linkedin.example/l', icon: 'linkedin' },
      { label: 'Gallery', href: '/gallery/', icon: undefined },
    ]);
  });

  test('never includes the Academic CV', () => {
    expect(footerLinks(full).map((l) => l.label)).not.toContain('Academic CV');
  });

  test('omits unset social links but keeps Gallery', () => {
    expect(footerLinks({ email: 'a@b.c' }).map((l) => l.label)).toEqual(['a@b.c', 'Gallery']);
  });
});
