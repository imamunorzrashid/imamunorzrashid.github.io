export type IconName = 'email' | 'scholar' | 'orcid' | 'github' | 'linkedin' | 'researchgate' | 'cv';

export type SiteLink = { label: string; href: string; icon?: IconName };

// The profile fields the link lists read. Empty or missing values are left out.
export type LinkSource = {
  email: string;
  links?: { scholar?: string; orcid?: string; github?: string; linkedin?: string; researchgate?: string };
  cv_academic?: string;
};

const present = (links: SiteLink[]) => links.filter((l) => Boolean(l.href));

const social = (p: LinkSource) => [
  { label: 'Google Scholar', href: p.links?.scholar ?? '', icon: 'scholar' as const },
  { label: 'ORCID', href: p.links?.orcid ?? '', icon: 'orcid' as const },
  { label: 'ResearchGate', href: p.links?.researchgate ?? '', icon: 'researchgate' as const },
  { label: 'GitHub', href: p.links?.github ?? '', icon: 'github' as const },
  { label: 'LinkedIn', href: p.links?.linkedin ?? '', icon: 'linkedin' as const },
];

export function homeLinks(p: LinkSource): SiteLink[] {
  return present([
    { label: 'Email', href: `mailto:${p.email}`, icon: 'email' },
    ...social(p),
    { label: 'Academic CV', href: p.cv_academic ?? '', icon: 'cv' },
  ]);
}

export function footerLinks(p: LinkSource): SiteLink[] {
  return present([
    { label: p.email, href: `mailto:${p.email}`, icon: 'email' },
    ...social(p),
    { label: 'Gallery', href: '/gallery/' },
  ]);
}
