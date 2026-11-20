# mamunorrashid.me redesign: design

Date: 2026-11-20 · Owner: Mamun Or Rashid

## Intent

The current site is a single long page where every section uses the same eyebrow, heading and card layout. It reads like a template. It needs to work as an academic home page for two audiences:

1. PhD supervisors and admission committees (Fall 2027 applications). They want research, publications, a CV and contact details, and they skim.
2. Lecturer hiring panels (EEE, CSE, ME, MTE departments). They want teaching experience, courses he can teach, and a CV.

Content edits must not require touching code. Mamun fills a form for a section, saves, commits and pushes, and the site rebuilds.

## Goals

- A quiet, typographic academic site, closer to a faculty or postdoc page than a startup landing page.
- Separate pages with real headings: Home, Research, Publications, Projects, Academics, Experience, Achievements, Teaching, CV, and Gallery (linked from the footer only). (Mamun, 2026-11-21)
- Every piece of content lives in YAML files under `src/content/`, and each collection has a matching form in a local CMS at `/admin`.
- Keep the domain `mamunorrashid.me` on GitHub Pages (repo `imamunorzrashid/imamunorzrashid.github.io`, `CNAME` = `mamunorrashid.me`). The deploy moves from "serve the repo root" to a GitHub Actions build of `dist/`.
- Cut the page weight: the old repo has 51 MB of assets, including a 12.7 MB JPG and three `.HEIC` files that Chrome can't display.
- Old links like `mamunorrashid.me/#publications` (which may already be in sent emails) still land on the right page.

## Non-goals

- No blog, no comments, no analytics dashboard, no dark mode, no i18n.
- No editing from a phone or other machines. Editing happens on Mamun's laptop only (decided 2026-11-20), so there's no OAuth proxy.
- No backend or database.

## Anti-goals (a failure even if it technically works)

- Any of these in the design: gradients, glows, glassmorphism, drop shadows on content, a card border around every item, icons next to every heading, uppercase eyebrow labels, animated counters, typing effects, scroll-reveal animations, emoji, stat badges, a full-viewport hero, a "Hi, I'm…" opener.
- Third-party widgets (the Flag Counter goes).
- Copy containing stock AI phrasing (see the banned list under Constraints).
- Any invented fact. Dates, CGPA, rank, author lists, venues and publication status come only from the existing site or from Mamun. Anything unclear is marked `TODO(Mamun)` and listed in `docs/content-todo.md`.

## Sources of truth (in priority order)

1. `docs/sources/cv-academic.pdf` (academic/PhD CV, Nov 2026), with its text in `cv-academic.txt` and its links in `cv-links.md`.
2. `docs/sources/cv-lecturer.pdf` (lecturer CV, Nov 2026). This is the only source for teaching interests, the HSC/SSC entries and the research & teaching profile paragraph.
3. `legacy/index.html` (the old site, Aug 2026). Used only for gallery captions and for items the CVs don't mention, and those items go to Mamun to decide (see the plan, Task 3).

Mamun's decisions (2026-11-20): B.Sc. started **2022**; Head of Electrical is **May – July 2026**; the Walton Hi-Tech industrial attachment, the EV-motors technical session, the IoT health monitor project and the "Advanced PCB / KiCad 9" certificate **stay on the site**; the public CV PDFs are web versions without references (and without his phone number). Later decisions (2026-11-20/21): the PADV review is removed for now; /cv/ shows only the CV download links.

Where the two CVs differ in wording, use the more specific one. Where they differ on a **fact** (a date or a number), don't pick one. Mark it `TODO(Mamun)`.

The website does **not** show his phone number or the referees' contact details.

## Current site (from the repo, 2026-11-20)

- `index.html` (one page), `style.css` (dark theme, Inter and Manrope fonts, radial and linear gradients, blurred "orbs", glass cards, backdrop blur), `script.js` (scroll-reveal, progress bar, animated counters, auto-rotating gallery carousel), `assets/` (CV PDF, images, logos), `CNAME`.
- Section anchors: `home, education, publications, leadership, industry, projects, honors, gallery, certifications, contact`. `#research` is linked but doesn't exist.
- The author lists are complete on the old site, and his name appears as **M. O. Rashid**.
- The profile photo is loaded from `https://github.com/imamunorzrashid.png`. There are two CV sources: `assets/Mamun_Or_Rashid_CV.pdf` and a Google Drive link.

## Constraints

- Stack: Astro (current stable) with the content layer (`src/content.config.ts`, `glob()` and `file()` loaders) and TypeScript strict. Static output.
- CMS: Sveltia CMS loaded from its CDN in `public/admin/index.html`, with `public/admin/config.yml`. It uses the **local repository workflow**: open `http://localhost:4321/admin/index.html` in Chrome or Edge while `npm run dev` is running, click "Work with Local Repository", and pick the repo folder. No proxy server is needed. Firefox can't do this. If Chrome or Edge isn't available, the fallback is Decap CMS with `local_backend: true` and `npx decap-server`.
- Tests: Vitest for helpers and content checks, and Playwright for page checks.
- Fonts are self-hosted through Fontsource: **Source Serif 4** (variable) for body and headings, and **IBM Plex Sans** (400, 500, 600) for the nav, metadata, labels and buttons.
- Colours: `--ink #1b1b1b`, `--muted #5c5c5c`, `--rule #e3e3e3`, `--bg #ffffff`, `--accent #1f4e79`, `--accent-hover #163a5a`. One accent colour only.
- Type scale: body 1.125rem/1.6 serif; h1 2rem; h2 1.5rem serif, weight 600; metadata 0.9rem sans in `--muted`.
- Layout: reading column `max-width: 44rem`, centred, text left-aligned. Header has the name on the left and the nav on the right, and the nav wraps onto a second line below 640px (no hamburger menu). Section separation uses whitespace and at most a 1px `--rule` line.
- Main nav (9 items, in this order): Home, Research, Publications, Projects, Academics, Experience, Achievements, Teaching, CV. (Mamun, 2026-11-21) The footer holds the email, Scholar, ORCID, GitHub, LinkedIn, Gallery, and "Last updated <build date>".
- Social links are text links, not icon buttons.
- Banned phrases in editable prose (case-insensitive): `passionate`, `cutting-edge`, `leverage`, `leveraging`, `seamless`, `seamlessly`, `delve`, `spearhead`, `harness the power`, `unlock`, `empower`, `world-class`, `game-changer`, `synergy`, `tapestry`, `thrilled`. Publication titles are exempt.
- Images: every file under `public/images/` is ≤ 500 KB, ≤ 1600 px wide, WebP or JPG, with a kebab-case filename (no spaces or apostrophes). Organisation logos aren't used in the new design.
- Accessibility: every image needs alt text (the schema enforces it), colour contrast meets WCAG AA, and each page has exactly one `<h1>`.

## Approaches considered

| Approach | Trade-off | Verdict |
|---|---|---|
| **Astro + content collections + Sveltia CMS (local)** | Real forms, content in Git, free static hosting, no server. Needs Chrome or Edge to edit. | **Chosen.** Fits laptop-only editing and keeps the site static. |
| Astro + Keystatic (local mode) | Polished form UI, but its admin routes need server rendering and an adapter. More moving parts for a static site. | Rejected |
| Jekyll "Academic Pages" or Hugo "al-folio"-style themes | Academic out of the box, but no forms (you edit Markdown by hand) and the look is recognisably stock. | Rejected: it fails the form requirement and the "not templated" goal. |
| Edit content in Google Sheets and fetch at build time | Familiar form-like editing, but adds a network dependency and an API key to the build, and is fragile. | Rejected |

## Information architecture

| Route | Content (collections used) |
|---|---|
| `/` | Photo, name, title line, affiliation, bio paragraph, "seeking" line, text links, research interests, latest 5 news items, featured publications (`profile`, `news`, `publications`) |
| `/research/` | Research statement, research themes, each with a short summary (`researchPage`) |
| `/publications/` | Grouped and numbered: Journal Articles [J], Conference Papers [C], Accepted [S], Under Review [U], In Preparation [P]. Reverse chronological within each group, with Mamun's name in bold (`publications`, `profile.pub_name`) |
| `/projects/` | Title, period, summary, tags, links (`projects`) |
| `/academics/` | Education entries, then technical skills (`education`, `profile`). (Mamun, 2026-11-21) |
| `/experience/` | Research, industry and leadership experience, then talks and service (`experience`, `activities`). (Mamun, 2026-11-21) |
| `/achievements/` | Academic and international awards, then certificates (`awards`, `certificates`). (Mamun, 2026-11-21) |
| `/teaching/` | Teaching statement, teaching experience, courses he's ready to teach (`teachingPage`, `teaching`) |
| `/cv/` | Download links for the Academic CV and the Teaching CV only (Mamun, 2026-11-21). Education, experience, awards, activities, certificates and skills stay in YAML and the CMS but aren't shown (`profile`) |
| `/gallery/` | Captioned photos (`gallery`) |
| `/admin/` | Sveltia CMS (development only) |

Old hash links: on `/`, `#research` goes to `/research/`, `#publications` to `/publications/`, `#projects` to `/projects/`, and `#gallery` to `/gallery/`. `#education` goes to `/academics/`, `#leadership` and `#industry` to `/experience/`, and `#honors` and `#certifications` to `/achievements/`. (Mamun, 2026-11-21) `#home` and `#contact` stay on `/`.

## Content model

Shorthand used below: `str`, `str?` (optional, and an empty string from the CMS is treated as missing), `md` (Markdown string), `ym` (a string matching `^\d{4}(-\d{2})?$`, for example `2023-03`), `[...]` (list).

- **profile** (`src/content/pages/profile.yaml`, single): `name`, `pub_name` (`"M. O. Rashid"`), `title`, `affiliation`, `location`, `email`, `photo`, `photo_alt`, `bio: md`, `seeking: str?`, `interests: [str]`, `links: {scholar?, orcid?, github?, linkedin?, researchgate?}`, `cv_academic: str?`, `cv_lecturer: str?`, `skills: [{label, items: [str]}]`
- **researchPage** (`src/content/pages/research.yaml`, single): `statement: md`, `themes: [{title, summary: md}]`
- **teachingPage** (`src/content/pages/teaching.yaml`, single): `statement: md`, `course_groups: [{department, courses: [str] (at least one)}]`
- **news** (`src/content/news/*.yaml`): `date: ym`, `text: md`, `link: str?`
- **publications** (`src/content/publications/*.yaml`): `title`, `authors: [str]`, `venue`, `type: journal|conference|preprint|thesis`, `status: published|accepted|under_review|in_preparation` (groups: Journal Articles [J], Conference Papers [C], Accepted [S], Under Review [U], In Preparation [P], following the CV's numbering), `year: number?` (required unless the status is `in_preparation`), `doi?`, `url?`, `pdf?`, `code?`, `featured: bool = false`, `note?`, `abstract: md?` (shown as a fold-out under the paper; Mamun, 2026-11-21)
- **projects** (`src/content/projects/*.yaml`): `title`, `order: number = 100`, `start: ym?`, `end: ym?`, `summary: md`, `tags: [str]`, `links: {code?, paper?, demo?}`, `image?`, `image_alt?` (required if `image` is set), `featured: bool = false`
- **education** (`src/content/education/*.yaml`): `degree`, `institution`, `location?`, `start: ym?`, `end: ym?` (if only `end` is set, show just that date), `thesis_title?`, `supervisor?`, `details: [str]`
- **experience** (`src/content/experience/*.yaml`): `role`, `org`, `kind: research|industry|leadership`, `start: ym`, `end: ym?`, `location?`, `link?`, `points: [str]`
- **teaching** (`src/content/teaching/*.yaml`): `role`, `context`, `start: ym`, `end: ym?`, `subjects: [str]`, `level?`, `description: md?`
- **awards** (`src/content/awards/*.yaml`): `title`, `issuer`, `category: academic|international`, `date: ym`, `end: ym?` (for ranges like 2021 – 2024), `description?`, `link?`
- **activities** (`src/content/activities/*.yaml`): `title`, `kind: talk|service|reviewing|outreach`, `event`, `date: ym`, `location?`, `link?`
- **certificates** (`src/content/certificates/*.yaml`): `title`, `issuer`, `date: ym`, `credential_url?`
- **gallery** (`src/content/gallery/*.yaml`): `image`, `alt` (required), `caption`, `date: ym?`

A missing `end` renders as "Present". CMS uploads go to `public/images/uploads/` (served at `/images/uploads/`). CV PDFs go in `public/cv/`, or the field holds a full URL.

## Edit workflow

1. `npm run dev`
2. In Chrome or Edge, open `localhost:4321/admin/index.html`, click "Work with Local Repository", and choose the repo folder (first time only).
3. Edit and save. Sveltia writes the YAML into the folder, and the dev server shows the change live.
4. `git add -A && git commit -m "content: …" && git push`. GitHub Actions rebuilds and deploys in about a minute.

The CMS is configured to resize and convert uploads to WebP, so new photos stay within the image budget.

## Models and roles (decided by Mamun)

- Planning and orchestration: Opus 5.5, the main Claude Code session.
- Implementation: Haiku 5.5, through the project subagent `implementer`.
- Review after each task and of the whole branch: Opus, through the project subagent `reviewer`.
- Copy rewriting (Task 9) is done by the orchestrator, because it needs judgment about Mamun's voice.

## Left to the builder

Component file names beyond those in the plan, exact spacing values, the CSS approach (plain CSS custom properties, no Tailwind), and the Playwright configuration details.
