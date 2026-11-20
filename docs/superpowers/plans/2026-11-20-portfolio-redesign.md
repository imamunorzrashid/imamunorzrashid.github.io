# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. The orchestrator is the main session (Opus). Dispatch each task to the `implementer` subagent (Haiku) and each review to the `reviewer` subagent (Opus). **Do not pass a `model` parameter when dispatching.** A per-call model overrides the agent's own model. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page portfolio with a multi-page Astro site whose content is edited through Sveltia CMS forms.

**Architecture:** Static Astro site. All content lives in YAML under `src/content/` and is validated by Zod schemas in `src/content.config.ts`. The pages are thin templates over the collections, small pure helpers in `src/lib/` are unit-tested, and Sveltia CMS at `/admin` edits the same YAML files through the browser's local-folder access.

**Tech Stack:** Astro (current stable), TypeScript strict, Vitest, @playwright/test, Fontsource (Source Serif 4, IBM Plex Sans), Sveltia CMS (CDN), `js-yaml` for tests.

**Spec:** `docs/superpowers/specs/2026-11-20-portfolio-redesign-design.md`

## Global Constraints

- Sources of truth, in order: `docs/sources/cv-academic.txt`, then `docs/sources/cv-lecturer.txt`, then `legacy/index.html`. Use the links in `docs/sources/cv-links.md`. Where the CVs disagree on a fact, write `TODO(Mamun)`. Never show the phone number or referees' contact details on the site.

- Never invent content. Any fact not in `legacy/` or given by Mamun becomes `TODO(Mamun)` and gets a line in `docs/content-todo.md`.
- Colours: `--ink #1b1b1b`, `--muted #5c5c5c`, `--rule #e3e3e3`, `--bg #ffffff`, `--accent #1f4e79`, `--accent-hover #163a5a`.
- Fonts: Source Serif 4 (body and headings), IBM Plex Sans 400/500/600 (nav, metadata, labels), self-hosted with Fontsource.
- Reading column `max-width: 44rem`; body `1.125rem/1.6`; h1 `2rem`; h2 `1.5rem`, weight 600.
- Main nav, in order: Home, Research, Publications, Projects, Teaching, CV. Gallery appears in the footer only.
- Banned phrases (case-insensitive) in editable prose: passionate, cutting-edge, leverage, leveraging, seamless, seamlessly, delve, spearhead, harness the power, unlock, empower, world-class, game-changer, synergy, tapestry, thrilled.
- Forbidden visuals: gradients, box-shadows on content, bordered cards around list items, uppercase eyebrow labels, animated counters, scroll or typing animations, emoji, icon-per-heading, full-viewport hero.
- Images in `public/images/`: ≤ 500 KB each, ≤ 1600 px wide, WebP or JPG, kebab-case names.
- Repo: `imamunorzrashid/imamunorzrashid.github.io`, branch `main`, hosted on GitHub Pages with custom domain `mamunorrashid.me`.
- `ym` date strings match `^\d{4}(-\d{2})?$`. A missing `end` renders as "Present".
- No Tailwind and no UI kits. Use plain CSS with custom properties in `src/styles/global.css`.
- Before writing Astro content-layer code, confirm the current API with Context7 (`glob`/`file` loaders and where `z` is imported from).

## Review Focus

1. **The CMS saves empty optional fields as `""`.** These must validate and render as if missing, with no empty links and no "undefined". Covered by `opt()` tests in Task 2.
2. **A publication with no DOI or year (in preparation).** It renders without a link and without a year, and it isn't sorted above dated items. Covered in Task 2 (`groupPublications`) and Task 5 (e2e).
3. **Old hash links (`/#publications` etc.) from emails already sent.** They must land on the new page. Covered in Task 4 (e2e).
4. **Long titles and author lists on a 375px phone.** There must be no horizontal scroll on any page. Covered by the overflow check in Task 10 across all routes.
5. **Images referenced in YAML that don't exist, or a 12 MB phone photo uploaded through the CMS.** The tests must fail rather than ship a broken or huge image. Covered by `tests/content-assets.test.ts` in Task 3 (existence and the 500 KB limit) and by the Sveltia upload transformations in Task 8.

---

### Task 1: Scaffold Astro beside the legacy site

**Files:**
- Move (with `git mv`): `index.html`, `style.css`, `script.js`, `assets/` → `legacy/`
- Move: `CNAME` → `public/CNAME` (contents `mamunorrashid.me`, unchanged)
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`), `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro` (placeholder), `tests/smoke.test.ts`, `.gitignore` (node_modules, dist, .astro, test-results, playwright-report)

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`), `e2e` (`playwright test`). Playwright `webServer` runs `npm run build && npm run preview` on port 4321, with `baseURL` `http://localhost:4321`.
- Produces: `astro.config.mjs` sets `site: 'https://mamunorrashid.me'` and `trailingSlash: 'always'`.

- [ ] **Step 1:** `git switch -c redesign`, then move the files as listed above. Run `git status`. Expected: only renames.
- [ ] **Step 2:** Scaffold the minimal Astro project (`npm create astro@latest . -- --template minimal --typescript strict --no-git --install`, or the current equivalent). Add the dev dependencies `vitest`, `@playwright/test`, `js-yaml`, `@types/js-yaml`, and run `npx playwright install chromium`.
- [ ] **Step 3:** Write `tests/smoke.test.ts` asserting `1 + 1 === 2`, so the runner is proven.
- [ ] **Step 4:** Run `npm run check && npm run build && npm test`. Expected: all exit 0, and `dist/index.html` exists.
- [ ] **Step 5:** Commit: `chore: scaffold Astro site, move old site to legacy/`

### Task 2: Content schemas and helpers

**Files:**
- Create: `src/content.config.ts`, `src/lib/schema.ts`, `src/lib/dates.ts`, `src/lib/pubs.ts`
- Test: `tests/lib/schema.test.ts`, `tests/lib/dates.test.ts`, `tests/lib/pubs.test.ts`
- Create: one minimal valid sample YAML per collection under `src/content/…` (all marked `TODO(Mamun)`, replaced in Task 3)

**Interfaces:**
- Produces `src/lib/schema.ts`:
  - `opt<T extends z.ZodTypeAny>(s: T)`: optional, with `''` or `null` preprocessed to `undefined`
  - `ym`: `z.string().regex(/^\d{4}(-\d{2})?$/)`
- Produces `src/lib/dates.ts`:
  - `formatYm(ym: string): string`: `"2023-03"` → `"Mar 2023"`, `"2023"` → `"2023"`
  - `formatRange(start: string, end?: string): string`: uses an en dash with spaces, and `end` undefined → `"Present"`
  - `ymSortKey(ym?: string): number`: `"2023-03"` → `202303`, `"2023"` → `202300`, `undefined` → `Number.POSITIVE_INFINITY` (ongoing items sort first in descending order)
- Produces `src/lib/pubs.ts`:
  - `type PubGroupKey = 'journal' | 'conference' | 'accepted' | 'under_review' | 'in_preparation'`
  - `groupPublications(pubs: Pub[]): { key: PubGroupKey; label: string; prefix: 'J'|'C'|'S'|'U'|'P'; items: Pub[] }[]`. A group is `accepted`, `under_review` or `in_preparation` by status. Otherwise (published) it's `journal` if the type is journal, else `conference`. Labels are "Journal Articles", "Conference Papers", "Accepted", "Under Review", "In Preparation", in that order. Empty groups are omitted. Within a group, items sort by year descending, with a missing year last, then by title.
  - `splitAuthors(authors: string[], self: string): { name: string; self: boolean }[]`. Self-matching is case-insensitive and ignores dots and extra spaces.
- Produces collections named exactly: `profile`, `researchPage`, `teachingPage`, `news`, `publications`, `projects`, `education`, `experience`, `teaching`, `awards`, `activities`, `certificates`, `gallery`, with fields exactly as in the spec's Content model.

- [ ] **Step 1: Write the failing tests**
  - `opt(z.string()).parse('')` → `undefined`. `opt(z.string()).parse('x')` → `'x'`. `opt(z.string().url()).parse('')` doesn't throw.
  - `ym.safeParse('2023-3').success === false`, and `ym.safeParse('2023').success === true`.
  - `formatRange('2021-03')` → `'Mar 2021 – Present'`. `formatRange('2021','2025')` → `'2021 – 2025'`. `ymSortKey(undefined) > ymSortKey('2099-12')`.
  - `groupPublications`: given [journal 2025, conference 2024, accepted 2026, under_review no-year, in_preparation no-year, journal 2023], expect group keys `['journal','conference','accepted','under_review','in_preparation']` and journal items in order 2025, 2023. An `accepted` journal lands in `accepted`, not `journal`.
  - The education schema accepts an entry with only `end: '2026-08'`, and `formatRange` isn't called without a start (the page shows `formatYm(end)`).
  - `splitAuthors(['M. O. Rashid','S. K. Sarker'], 'M.O. Rashid')` → first item has `self: true`, second has `self: false`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules not found).
- [ ] **Step 3:** Implement the helpers and `src/content.config.ts`. Publications use `.refine(p => p.status === 'in_preparation' || p.year !== undefined, 'year required unless in_preparation')`. Projects use a refine requiring `image_alt` when `image` is set. Publications `year` is required for `published` and for `accepted` when known; for `accepted` without a year, allow it to be missing.
- [ ] **Step 4:** Run `npm test && npm run check && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: content schemas and date/publication helpers`

### Task 3: Migrate content from legacy

**Files:**
- Create: YAML entries under `src/content/**` for everything in `legacy/index.html`. File names are kebab-case slugs, for example `publications/2026-ecmx-domain-guided-distributed-control.yaml`.
- Create: `scripts/optimize-images.mjs` (uses `sharp`, which Astro already depends on; add it to devDependencies explicitly)
- Create: `docs/content-todo.md`
- Move: images and PDFs that `legacy/` references → `public/images/` and `public/cv/`
- Test: `tests/content-lint.test.ts`, `tests/content-assets.test.ts`

**Interfaces:**
- Consumes: the collections from Task 2.
- Produces: `docs/content-todo.md`, a checklist of every `TODO(Mamun)` with its file path and what's needed.

- [ ] **Step 1: Write the failing tests**
  - `content-safety`: no YAML under `src/content/` contains a phone number (Bangladeshi mobile formats, with or without +880) or an `@mte.ruet.ac.bd`/`@me.ruet.ac.bd` email (referee and phone details stay off the site).
  - `content-lint`: for every YAML file under `src/content/` except `publications/`, the lower-cased text contains none of the Global Constraints' banned phrases. The failure message names the file and the phrase.
  - `content-assets`: for every string value in any YAML that starts with `/images/` or `/cv/`, `public/<value>` exists. Every file under `public/images/` is ≤ 500 KB and its name matches `^[a-z0-9-]+\.(webp|jpg)$`.
- [ ] **Step 2a:** Implement `node scripts/optimize-images.mjs <inDir> <outDir>`. For each `.jpg`, `.jpeg` or `.png` it resizes to max 1600 px wide (no upscaling), writes WebP at quality 80, and kebab-cases the name (`"graduation certification taken from Hon'ble VC sir.jpg"` → `graduation-certification-taken-from-honble-vc-sir.webp`). If the output is still over 500 KB, it retries at quality 65 and then at 1200 px. It skips `.HEIC` and prints a list of what it skipped. Run it with `legacy/assets/images/photogallery` → `public/images/gallery`, `legacy/assets/images/projects` → `public/images/projects`, and `legacy/assets/images/research` → `public/images/research`. Skip the `logos/` folder. Certificate images go to `public/images/certificates`, and `awards/irdc.png` goes to `public/images/awards`.
- [ ] **Step 2b:** Never publish `docs/sources/cv-*.pdf`: they contain references and a phone number. If `docs/sources/cv-academic-web.pdf` or `cv-lecturer-web.pdf` exist (web versions Mamun exports, with "References available on request" and no phone), copy them to `public/cv/mamun-or-rashid-cv-academic.pdf` and `public/cv/mamun-or-rashid-cv-teaching.pdf` and set `profile.cv_academic` and `profile.cv_lecturer`. Otherwise leave both fields empty and log the request in `content-todo.md`. The old `assets/Mamun_Or_Rashid_CV.pdf` and the Google Drive link are superseded. Download `https://github.com/imamunorzrashid.png?size=460` → `public/images/profile.jpg` (if there's no network, log it in `content-todo.md`).
- [ ] **Step 2:** Migrate. Copy text **verbatim** from the sources (no rewriting; that's Task 9). Use the CVs for: profile (interests, links, skills), education (B.Sc. with CGPA 3.90/4.00 and rank 3rd of 58 as `details`, thesis, supervisor, coursework; HSC 2020 and SSC 2017 from the lecturer CV), publications (all three, with the DOIs from `cv-links.md`; the Next Energy paper is `status: accepted`, `type: journal`), experience (the two research roles, kind research; the Team Crack Platoon roles, kind leadership, with `link: https://teamcrackplatoon.com/`, Head of Electrical `start: '2026'`; the Walton Hi-Tech industrial attachment from `legacy/`, kind industry, Mar–Apr 2023), projects (the four CV projects in CV order, `order` 1–4), awards (with category and links), certificates (the three in the CVs), the EV-motors technical session from `legacy/` into `activities` (kind talk), the IoT health monitor from `legacy/` as project `order: 5`, the PADV review from `legacy/` as `status: in_preparation`, the "Advanced PCB / KiCad 9" certificate from `legacy/` (details from its image filename and the old page), the B.Sc. with `start: '2022'`, `end: '2026-08'`, and teachingPage (`courses_primary` and `courses_also` from the lecturer CV's Teaching Interests). Set `profile.bio` to the lecturer CV's "Research & Teaching Profile" paragraph, verbatim, as a starting point for Task 9. Old sections map as follows: Leadership → `experience` (kind leadership), Industrial Attachment → `experience` (kind industry), Honors → `awards`, Professional Activities → `activities`, Training → `certificates`. Delete the Task 2 samples. Gallery captions come from the old `alt`, caption text or filename, and the alt text must describe the photo. Drop the Flag Counter.
- [ ] **Step 3:** Log these in `content-todo.md` and don't resolve them: the web CV PDFs (see Step 2b); the VC's List and Technical Scholarship span "2021 – 2024" in both CVs against a B.Sc. start of 2022 (confirm the years); the academic CV still says Head of Electrical 2025 – 2026 (Mamun to fix in the PDF; the site uses 2026); the date and details of the EV-motors session and the KiCad 9 certificate if `legacy/` doesn't give them; the 3 `.HEIC` gallery photos (to export as JPG); the 12.7 MB `class representative award.jpg` (confirm the optimised version looks fine); `teachingPage` (new content needed); `researchPage` (the old site has no Research section); the PADV review's full author list (the old site says "M. O. Rashid, et al."), if it's kept. `profile.pub_name` is `M. O. Rashid`.
- [ ] **Step 4:** Run `npm test && npm run build`. Expected: PASS. If the build fails on a schema error, fix the YAML, not the schema.
- [ ] **Step 5:** Commit: `content: migrate legacy content to collections`

### Task 4: Base layout, design tokens, home page

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Prose.astro` (renders an `md` string with `marked`, an added dependency), `src/pages/index.astro` (replace)
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Produces `Base.astro` props: `{ title: string; description?: string }`. The page `<title>` is `"{title} | Mamun Or Rashid"`, or just the name on the home page.
- Produces `Prose.astro` props: `{ md: string; inline?: boolean }`.
- Produces in `global.css` the CSS custom properties from Global Constraints, plus `.meta` (sans, 0.9rem, `--muted`) and `.section` (top margin 3rem, no border).

- [ ] **Step 1: Write the failing e2e tests** (`home.spec.ts`)
  - `/` has exactly one `h1` with text equal to `profile.name`.
  - The header nav has exactly 6 links, with texts `Home, Research, Publications, Projects, Teaching, CV` in order.
  - At a 375×800 viewport, `document.documentElement.scrollWidth <= 375`.
  - Navigating to `/#publications` ends at `/publications/`, `/#research` ends at `/research/`, and `/#honors`, `/#industry` and `/#certifications` end at `/cv/`. `/#contact` stays on `/`.
  - The footer contains the text "Last updated".
  - `getComputedStyle(body).fontFamily` contains "Source Serif 4".
- [ ] **Step 2:** Run `npm run e2e -- home`. Expected: FAIL.
- [ ] **Step 3:** Implement it. Home order: photo (160px square, `border-radius: 4px`) beside the name, title, affiliation and `seeking` line on ≥768px, stacked below that; then the bio; the text links row (Email · Google Scholar · ORCID · GitHub · LinkedIn, showing only links that are set); Research Interests (h2, comma-separated or a short list); News (h2, latest 5 by `ymSortKey` descending, date in `.meta`); Selected Publications (h2, `featured: true`, using the entry format from Task 5, so leave a placeholder component `PubEntry.astro` here with props `{ pub; selfName }`). The hash-redirect script is inline on `index.astro` only and maps the hashes listed in the spec.
- [ ] **Step 4:** Run `npm run e2e -- home && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: base layout, design tokens, home page`

### Task 5: Publications and Research pages

**Files:**
- Create/finish: `src/components/PubEntry.astro`, `src/pages/publications.astro`, `src/pages/research.astro`
- Test: `tests/e2e/publications.spec.ts`

**Interfaces:**
- Consumes: `groupPublications` and `splitAuthors` (Task 2), `Prose` (Task 4).
- `PubEntry` renders IEEE-style: `[J1]`, then the authors with self in `<strong>`, `"Title,"`, *Venue*, year, followed by `.meta` links (DOI as `https://doi.org/<doi>`, PDF, Code), each only if set. Status text "Under review" or "In preparation" appears in `.meta` when relevant. Numbering restarts per group and counts down so the newest is highest (J3, J2, J1).

- [ ] **Step 1: Write the failing e2e tests**
  - `/publications/` has `h2`s whose texts are a subset of `["Journal Articles","Conference Papers","Accepted","Under Review","In Preparation"]` and appear in that order. The Next Energy entry appears under "Accepted" as `[S1]`.
  - Every `a[href^="https://doi.org/"]` has a non-empty path after the domain.
  - No element text contains "undefined" or "null".
  - Each entry under the "In Preparation" `h2` has no `a[href^="https://doi.org/"]` and no 4-digit year in its text. If Mamun drops the PADV entry, nothing is in preparation and this check is skipped with `test.skip` and a reason.
  - `/research/` has one `h1` "Research" and at least one `h2`.
- [ ] **Step 2:** Run it to verify it fails.
- [ ] **Step 3:** Implement it. The publications page has an intro line with Scholar and ORCID text links from `profile.links`. The research page renders `statement`, then each theme as `h2` plus `Prose`.
- [ ] **Step 4:** Run `npm run e2e -- publications && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: publications and research pages`

### Task 6: Projects and Teaching pages

**Files:** Create `src/pages/projects.astro`, `src/pages/teaching.astro`, `src/components/Entry.astro`. Test: `tests/e2e/projects-teaching.spec.ts`

**Interfaces:**
- Produces `Entry.astro` props: `{ heading: string; sub?: string; range?: string; }` plus a default slot for the body. It renders the heading (h3), `sub` and `range` on one `.meta` line, and the body. This is the shared list-item format for Tasks 6 and 7. It has no border and no background.

- [ ] **Step 1: Write the failing e2e tests:** each page has one `h1`. Projects: every project title appears as an `h3`, and code links open the right `href`. Teaching: an `h2` "Teaching Statement", an `h2` "Teaching Experience", and an `h2` "Courses I Can Teach", with the primary list followed by an "Also prepared to teach" line (each part shown only if its list isn't empty).
- [ ] **Step 2:** Run it to verify it fails.
- [ ] **Step 3:** Implement it. Projects sort by `order` ascending, then by title. Each project has an optional image (max-width 100%, `loading="lazy"`, `alt` from `image_alt`) and its tags as a plain `.meta` comma list (no pills).
- [ ] **Step 4:** Run it to verify it passes, along with the build.
- [ ] **Step 5:** Commit: `feat: projects and teaching pages`

### Task 7: CV and Gallery pages

**Files:** Create `src/pages/cv.astro`, `src/pages/gallery.astro`. Test: `tests/e2e/cv-gallery.spec.ts`

- [ ] **Step 1: Write the failing e2e tests:**
  - `/cv/` `h2` texts, in order, are a subset of `["Education","Research Experience","Industry Experience","Leadership","Awards and Honours","Talks and Service","Certificates","Technical Skills"]`. Awards and Honours has `h3` "Academic" before `h3` "International". The page text contains no `+880`.
  - The CV download links render only for the set `cv_academic`/`cv_lecturer` values, labelled "Academic CV (PDF)" and "Teaching CV (PDF)".
  - `/gallery/`: every `img` has a non-empty `alt`, and the figure count equals the number of gallery entries.
- [ ] **Step 2:** Run it to verify it fails.
- [ ] **Step 3:** Implement it with `Entry.astro`. Within each section items sort by `ymSortKey` descending (ongoing first). Certificates render as a compact list: title, issuer, date and an optional link, one line each. The gallery is a CSS grid (`repeat(auto-fill, minmax(220px, 1fr))`) of `<figure>` with `<figcaption>`, with no lightbox and no carousel.
- [ ] **Step 4:** Run it to verify it passes, along with the build.
- [ ] **Step 5:** Commit: `feat: cv and gallery pages`

### Task 8: Sveltia CMS forms

**Files:** Create `public/admin/index.html`, `public/admin/config.yml`, and `README.md` (a "How to edit" section). Test: `tests/cms-config.test.ts`

**Interfaces:**
- `config.yml`: `backend: { name: github, repo: imamunorzrashid/imamunorzrashid.github.io, branch: main }`, `media_folder: public/images/uploads`, `public_folder: /images/uploads`, and upload transformations under `media_libraries.default.config.transformations` converting raster images to WebP at quality 80 with a maximum width of 1600 (check the exact keys in the current Sveltia docs). A `files` collection called "Pages" has three files (profile, research, teaching). There is one `folder` collection per remaining collection, with `extension: yml`, `format: yaml`, `create: true`, and a `slug` built from the title or date fields.
- Widgets: `ym` fields use a `string` with `pattern: ['^\d{4}(-\d{2})?$', 'Use YYYY or YYYY-MM']`. Enums use `select`. Lists of strings use `list`. `md` fields use `markdown`. Images use `image`. `featured` uses `boolean`. Optional fields have `required: false`.

- [ ] **Step 1: Write the failing test** `cms-config.test.ts`:
  - The config parses with js-yaml.
  - Every `folder` collection's folder exists under `src/content/`.
  - For every existing YAML entry in that folder, every top-level key in the entry appears as a field `name` in the collection (so the forms can edit everything).
  - The same check runs for each `files` entry.
  - Every field with `widget: image` has a `media_folder` that is either inherited or set.
- [ ] **Step 2:** Run it to verify it fails.
- [ ] **Step 3:** Implement it. `index.html` loads `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`, following the current Sveltia docs (check with Context7 or the docs). Add `<meta name="robots" content="noindex">`. Write the README "How to edit" section with the 4-step workflow from the spec, including the Chrome/Edge requirement.
- [ ] **Step 4:** Run `npm test`. Expected: PASS. Then the **orchestrator** asks Mamun to do a manual check: run `npm run dev`, open `/admin` in Chrome, connect the local repository, edit a news item, and confirm the YAML changes in `git diff`.
- [ ] **Step 5:** Commit: `feat: Sveltia CMS forms for all collections`

### Task 9: Copy pass (orchestrator, not implementer)

The orchestrator (Opus) does this with the `humanizer` skill.

- [ ] Rewrite the prose fields (bio, project summaries, experience points, news) into concrete, plain sentences. Keep every fact, number and name unchanged. Add no facts.
- [ ] Draft `researchPage` and `teachingPage` **only** from material Mamun provides in the conversation. Otherwise leave the `TODO(Mamun)` markers in place.
- [ ] Show Mamun a before/after diff of each changed field and commit only what he approves: `content: copy edit`.
- [ ] Run `npm test && npm run build`. Expected: PASS (the banned-phrase lint included).

### Task 10: Whole-site QA and deploy

**Files:** Create `tests/e2e/site.spec.ts`. Delete `legacy/` (after Mamun approves the preview). Add the deploy config for the current host.

- [ ] **Step 1: Write the e2e test** `site.spec.ts`. For each route in `['/', '/research/', '/publications/', '/projects/', '/teaching/', '/cv/', '/gallery/']`:
  - The response is 200 with exactly one `h1`.
  - `scrollWidth <= 375` at a 375px width.
  - Every internal `a[href^="/"]` returns 200 (collect the hrefs, de-duplicate, then `request.get`).
  - No visible text contains "TODO(Mamun)". This check is expected to fail until the content is complete. Mark it `test.fixme` until `docs/content-todo.md` is empty.
- [ ] **Step 2:** Run `npm run e2e`. Expected: PASS, apart from the fixme.
- [ ] **Step 3:** The orchestrator takes screenshots at 375px and 1280px with the Playwright MCP for every route, and reviews them against the spec's anti-goals list.
- [ ] **Step 4:** Add `.github/workflows/deploy.yml`: on push to `main` and on `workflow_dispatch`, run `withastro/action` (build) and then `actions/deploy-pages`, with `permissions: { contents: read, pages: write, id-token: write }`. Keep `public/CNAME`.
- [ ] **Step 5:** Mamun previews locally with `npm run build && npm run preview`. After he approves, run `git rm -r legacy/` and commit.
- [ ] **Step 6 (order matters):** First, Mamun switches the repo's Settings → Pages → Source from "Deploy from a branch" to **GitHub Actions**. Only then merge `redesign` into `main` and push. If the merge happens first, Pages serves the raw Astro source and the live site breaks. Afterwards, check that the Actions run is green, that `https://mamunorrashid.me/` loads the new site, and that the custom domain still shows in Settings → Pages.
