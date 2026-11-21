# Stories and Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. The orchestrator is the main session (Opus). Dispatch each task to the `implementer` subagent (Haiku) and each review to the `reviewer` subagent (Opus). **Do not pass a `model` parameter when dispatching.** Task 8 (copy) and Task 9 (release) belong to the orchestrator. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the CV-shaped site into one organised around Mamun's work, with story pages, logos, photos, PDFs and click-to-play videos, all editable in the CMS.

**Architecture:** Same static Astro site. New optional fields go into the Zod schemas in `src/lib/schema.ts` and the matching Sveltia forms. Two small pure helpers are unit-tested: `src/lib/video.ts` parses video URLs and `src/lib/timeline.ts` builds the About timeline. Story pages are generated from `projects` entries that have a `story`. `/academics/`, `/experience/` and `/achievements/` merge into `/about/` and redirect there.

**Tech Stack:** Astro 7, TypeScript strict, Zod (`astro/zod`), Vitest, Playwright, Sveltia CMS, `marked`, `js-yaml`.

**Spec:** `docs/superpowers/specs/2026-11-22-stories-and-media-design.md` (builds on `docs/superpowers/specs/2026-11-20-portfolio-redesign-design.md`)

## Global Constraints

- Work on branch `redesign`. Never push to `main`. Commit after each task with a conventional message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Run `git status` before each commit: Mamun edits in the CMS, and only the task's files go in the commit.
- Never invent facts. Anything not already in `src/content/` or given by Mamun becomes `TODO(Mamun)` and gets a line in `docs/content-todo.md`. Pages never hard-code content.
- Colours: `--ink #1b1b1b`, `--muted #5c5c5c`, `--rule #e3e3e3`, `--bg #ffffff`, `--accent #1f4e79`, `--accent-hover #163a5a`, and new `--figure-bg #f5f5f3` (flat colour behind figures and video posters).
- Fonts: Source Serif 4 (body and headings), IBM Plex Sans (nav, meta, captions). No new fonts and no second accent colour.
- Widths: reading column `44rem`. Figures, photo strips and story lead images may widen to `60rem` at `min-width: 64rem`. Margin dates apply at `min-width: 64rem`.
- Main nav, in order: Research, Projects, Publications, Teaching, About, CV. The site name links to `/`. Gallery appears only in the footer.
- Forbidden visuals: gradients, shadows, bordered or filled cards around items, uppercase eyebrow labels, animations or transitions, hover zoom, emoji, icon-per-heading, full-viewport hero, tabs, carousels, lightbox libraries.
- Every media slot renders only when its field is filled. No placeholders, no empty headings.
- Logos: 40px tall, full colour, `alt=""` (the name sits beside them). Image fields need alt text (schema-enforced).
- Video embeds load nothing from YouTube or Facebook until the reader clicks. YouTube uses `https://www.youtube-nocookie.com/embed/…`. Without JavaScript, a video is a plain link.
- No new npm dependencies.
- Images in `public/images/` are ≤ 500 KB, kebab-case, WebP or JPG (SVG or PNG allowed under `public/images/logos/`). PDFs in `public/docs/` are ≤ 10 MB, kebab-case `.pdf`.
- Banned phrases (content lint): the existing list plus `journey`, `landscape`, `testament`, `pivotal`, `meticulous`, `showcase`, `realm`, `foster`, `at the intersection of`, `deeply`, `i am excited`, `in today's`. Publication titles are exempt.
- Confirm current APIs with Context7 before writing config code: Astro `redirects` (with `#fragment` targets and `trailingSlash: 'always'`), Astro `getStaticPaths`, and Sveltia per-field `media_folder`/`public_folder` on `file` and `image` widgets.

## Review Focus

1. **CMS saves of new optional lists and objects** (`images: []`, a video with `poster: ''`, `image: {src: '', alt: ''}`) must validate and render nothing. Tested in Task 1 (schema).
2. **A stale CMS tab saves project `links` in the old object shape** (`{code, paper, demo}`). The schema converts it to the new list instead of failing the build. Tested in Task 1.
3. **Real-world video URLs:** `watch?v=ID&t=30s`, `youtu.be/ID?si=…`, `/shorts/ID`, playlists, `fb.watch/…`, and plain non-video URLs. Each becomes the right embed, or a plain link; never a broken iframe. Tested in Task 2.
4. **Old links from sent emails:** `/academics/`, `/experience/`, `/achievements/` and `/#education`, `/#honors` etc. land on the right About section. Tested in Task 4 (e2e).
5. **Wide figures, photo strips, margin dates and long titles at 375px:** no horizontal scroll on any route, including story pages. Tested in Task 9 (overflow check over all routes).

---

### Task 1: Schema, CMS fields and content migration

**Files:**
- Modify: `src/lib/schema.ts`, `public/admin/config.yml`, `src/pages/projects.astro` (links rendering only), the 4 files in `src/content/projects/`
- Create: `src/content/projects/false-data-injection.yaml`, `src/content/projects/ecmx-transfer-learning.yaml`, `public/docs/.gitkeep`, `public/images/logos/.gitkeep`
- Test: `tests/lib/schema.test.ts`, `tests/content-assets.test.ts`, `tests/content-refs.test.ts` (new), `tests/e2e/projects-teaching.spec.ts`

**Interfaces:**
- Produces in `src/lib/schema.ts` (exported):
  - `link = z.object({ label: str, url: str })`
  - `img = z.object({ src: str, alt: z.string().min(1), caption: opt(str) })`, plus `optImg`: an optional `img` that treats `''`, `null` and `{src: ''}` (any value whose `src` is empty) as missing
  - `video = z.object({ url, title: str, poster: opt(str) })`
  - `links = blank(z.array(link).default([]))`. For `project.links` only, a preprocess also accepts the old object `{code?, paper?, demo?}` and maps it, in that order, to `[{label:'Code'}, {label:'Paper'}, {label:'Demo'}]`, skipping empty values.
- New fields, exactly as in the spec's "Content model changes" table, plus `audience_line` on profile and these two on `project` (from the spec's "Calls settled"): `draft: bool` (default false; a draft story page is built only in dev) and `kind: z.enum(['research','build'])` defaulting to `'build'`. Lists default to `[]`.
- Produces content: two `kind: research` projects (below). Later tasks rely on the slugs `false-data-injection` and `ecmx-transfer-learning`.

- [ ] **Step 1: Write the failing tests** in `tests/lib/schema.test.ts`:
  - `project.parse({title:'T', summary:'S', links:{code:'https://c', paper:'', demo:'https://d'}}).links` → `[{label:'Code',url:'https://c'},{label:'Demo',url:'https://d'}]`
  - `project.parse({title:'T', summary:'S'})` → `kind === 'build'`, `links`, `images`, `videos`, `tools` all `[]`, `draft === false`
  - `project.parse({..., images:[{src:'/images/a.webp', alt:''}]})` throws (alt required)
  - `project.parse({..., videos:[{url:'https://youtu.be/x', title:'Run', poster:''}]}).videos[0].poster` → `undefined`
  - `experience.parse({role:'R', org:'O', kind:'research', start:'2025', image:{src:'', alt:''}}).image` → `undefined`
  - `education.parse({degree:'D', institution:'I', logo:''}).logo` → `undefined`
  - `researchPage.parse({statement:'S', questions:['Q?'], themes:[{title:'T', summary:'S', story:''}]}).themes[0].story` → `undefined`
- [ ] **Step 2:** Write `tests/content-refs.test.ts`. Every `story` value in `src/content/education/*.yaml`, `awards/*.yaml` and `pages/research.yaml` `themes[]` must equal the filename (without `.yaml`) of a project whose `story` is non-empty. Extend `tests/content-assets.test.ts`: paths starting `/docs/` must exist under `public/`; files in `public/docs/` match `^[a-z0-9-]+\.pdf$` and are ≤ 10 MB; files under `public/images/logos/` may also be `.png` or `.svg`.
- [ ] **Step 3:** Run `npm test`. Expected: the new schema tests FAIL.
- [ ] **Step 4:** Implement the schema changes. Migrate the 4 existing project files to the list `links` (labels `Code`, `Paper`, `Demo`) and set `kind: build`. Update `projects.astro` to render `p.links` as `label` links joined by ` · ` (the full redesign of that page comes in Task 6). Update the e2e link test to read the list.
- [ ] **Step 5:** Create the two research projects. Use only text already in `src/content/`:
  - `ecmx-transfer-learning.yaml`: title "Transfer learning for frequency control under scarce, noisy data", `kind: research`, `order: 1`, `featured: true`, `start: '2025'`, `end: '2026'`, `team: 'EPIC Research Group, RUET'`, `role: 'First author'`, `tools: ['MATLAB/Simulink', 'OPAL-RT (OP5700)']`, `outcome: 'Up to 64% lower MSE and 35% less training time than training from scratch'`, `summary`: the first two sentences of the "Data-efficient frequency control with transfer learning" theme in `research.yaml`, verbatim. `image: /images/research/ecmx-methodology.webp` with an `image_alt` that describes the figure. `links: [{label: 'Paper', url: <the sciencedirect URL in that theme>}]`. `draft: true`. `story`: that theme's full summary, verbatim, followed by a paragraph `TODO(Mamun): answers to the story questions.`
  - `false-data-injection.yaml`: title "Defending microgrids against false data injection", `kind: research`, `order: 2`, `featured: true`, `start: '2025'`, `end: '2026'`, `team` and `role` as above, `outcome: '86.2% lower maximum frequency deviation than an LSTM-based detector'`, `summary`: the first two sentences of the "Cyber-resilient control against false data injection" theme, verbatim, `links: [{label: 'Paper (accepted)', url: <the ResearchGate URL in that theme>}]`, no `story` yet.
  - Set `featured: true` on `electrical-system-formula-sae-ev.yaml`.
- [ ] **Step 6:** Add a CMS field for every new schema field in `public/admin/config.yml`:
  - `links`: a `list` of `{label, url}`
  - `images`: a `list` of `{src (image), alt, caption}`
  - `videos`: a `list` of `{url, title, poster (image)}`
  - `logo`: an `image` widget with `media_folder: /public/images/logos`, `public_folder: /images/logos`
  - PDF fields: a `file` widget with `media_folder: /public/docs`, `public_folder: /docs`. Use it as the `url` widget inside the education and project `links` lists, or add a separate "Upload a PDF" hint if Sveltia can't mix modes.
  - The project `story` field is `markdown`, with the hint: "Suggested headings: What the problem was · What I did · What went wrong · What I'd do differently".
- [ ] **Step 7:** Run `npm test && npm run check && npm run build`. Expected: PASS, and `tests/cms-config.test.ts` confirms the CMS and schema field names match. Add a line to `docs/content-todo.md` for the ECMX story TODO.
- [ ] **Step 8:** Commit: `feat: media, story and link fields in schema and CMS`

### Task 2: Video and timeline helpers

**Files:**
- Create: `src/lib/video.ts`, `src/lib/timeline.ts`
- Test: `tests/lib/video.test.ts`, `tests/lib/timeline.test.ts`

**Interfaces:**
- Produces `parseVideo(url: string): { kind: 'youtube' | 'facebook' | 'link'; embed?: string; poster?: string }`
- Produces `type TimelineItem = { ym: string; text: string; href: string }` and `buildTimeline(src: TimelineSource): { year: string; items: TimelineItem[] }[]`, where `TimelineSource = { education: Education[]; experience: Experience[]; awards: Award[]; publications: Pub[]; stories: { slug: string; title: string; end?: string; outcome?: string }[] }` (the `z.infer` types of the Task 1 schemas)

- [ ] **Step 1: Write the failing tests**
  - `parseVideo('https://www.youtube.com/watch?v=abc123XYZ_-&t=30s')` → `{kind:'youtube', embed:'https://www.youtube-nocookie.com/embed/abc123XYZ_-?autoplay=1', poster:'https://i.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg'}`. The same `embed` and `poster` for `https://youtu.be/abc123XYZ_-?si=q` and `https://www.youtube.com/shorts/abc123XYZ_-`.
  - `parseVideo('https://www.youtube.com/playlist?list=PL1')` → `embed: 'https://www.youtube-nocookie.com/embed/videoseries?list=PL1&autoplay=1'`, `poster: undefined`
  - `parseVideo('https://www.facebook.com/watch/?v=1127887169236901')` and `parseVideo('https://www.facebook.com/somepage/videos/123/')` → `kind:'facebook'`, with `embed` equal to `'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=1&href=' + encodeURIComponent(url)`
  - `parseVideo('https://fb.watch/xyz/')`, `parseVideo('https://example.com/a.mp4')` and `parseVideo('not a url')` → `{kind:'link'}`
  - `buildTimeline`:
    - education with `end:'2026-08'` → `{ym:'2026-08', text: degree, href:'/about/#education'}`
    - education with only `start` → dated by `start`
    - experience → `` `${role}, ${org}` ``, `/about/#work`, dated by `start`
    - award → `title`, `/about/#recognition`
    - a publication with `year: 2026` → `ym: '2026'`, `text: title`, `/publications/`; one without a year is omitted
    - a story with `end` and `outcome` → `` `${title}: ${outcome}` ``, `/projects/<slug>/`; a story without `end` is omitted
    - years come out descending; within a year, items keep source order (education, experience, awards, publications, stories), then `ym` descending
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement both with `new URL()` inside a try/catch. YouTube IDs match `[\w-]{11}` or are taken as given from `v=`. Hosts: `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`, `www.facebook.com`, `facebook.com`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: video URL parser and About timeline builder`

### Task 3: Media components and story pages

**Files:**
- Create: `src/components/Figure.astro`, `src/components/PhotoStrip.astro`, `src/components/Video.astro`, `src/components/AtAGlance.astro`, `src/pages/projects/[slug].astro`
- Modify: `src/components/Entry.astro` (optional `logo` and `date` props), `src/styles/global.css`
- Test: `tests/e2e/story.spec.ts` (new)

**Interfaces:**
- Consumes: `parseVideo` (Task 2). The `img`, `video` and `link` shapes and the project fields (Task 1).
- Produces:
  - `<Figure src alt caption? number? wide? />`: `<figure>`, where the image links to its own file. The caption is prefixed `Fig. {number}.` when `number` is set.
  - `<PhotoStrip images={img[]} startNumber? />`: a wrapping row of figures, `wide`
  - `<Video url title poster? />`: for `youtube`/`facebook`, a 16:9 `<a href={url}>` holding the poster (or `--figure-bg`) and a "▶ Play: {title}" label. One inline script replaces it with `<iframe src={embed} allow="autoplay; fullscreen" title={title}>` on click and prevents navigation. Facebook without a poster, and `link`, render as a text link "▶ {title}".
  - `<AtAGlance items={{label, value}[]} />`: a `<dl>`. Items with an empty value are dropped, and nothing renders if none remain. At ≥ 64rem it floats right into the margin with a 1px `--rule` left border; below that it sits inline.
  - `<Entry heading sub? range? logo? date? />`: `logo` renders a 40px `<img alt="">` to the left of the text. `date` renders in a `.margin-date` element (sans, `font-variant-numeric: tabular-nums`) that hangs in the left margin at ≥ 64rem and sits inline above the heading below that.
  - Global CSS: `.wide` (max-width 60rem, centred, at ≥ 64rem), `figure`/`figcaption` styles, `--figure-bg`.
  - Story route: `getStaticPaths` over projects with a non-empty `story` and (`!draft` or `import.meta.env.DEV`), slug = entry id.

- [ ] **Step 1: Write the failing e2e test** `tests/e2e/story.spec.ts`. Read `src/content/projects/*.yaml` and select stories with `story` set and `draft` false. Production builds skip drafts, so with today's content the list may be empty: guard each test with `test.skip(stories.length === 0)`, and add one test that `/projects/ecmx-transfer-learning/` returns 404 while it is a draft. For each published story:
  - one `h1` equal to the title
  - figure captions numbered `Fig. 1.`, `Fig. 2.`, … in document order with no gaps
  - no `dt` followed by an empty `dd`
  - every `iframe` count is 0 before any click
  - "← All projects" links to `/projects/`; previous/next links point to the neighbouring stories by `order`, then title
- [ ] **Step 2:** Run `npm run e2e -- story`. Expected: the 404 test FAILS (no route yet) or the suite errors.
- [ ] **Step 3:** Build the components and the story page. Layout top to bottom, as the spec's "Story page" sketch shows:
  - back link
  - `h1`
  - standfirst (muted)
  - lead `Figure` (wide, Fig. 1) from `image`
  - `AtAGlance` (Role: role, Team: team, Period: range, Tools: tools joined by ", ", Outcome: outcome)
  - story `Prose`
  - `PhotoStrip` (continues the numbering)
  - each `Video`
  - "Documents and links" line from `links`
  - prev/next nav
- [ ] **Step 4:** Run `npm run dev` and open `/projects/ecmx-transfer-learning/`. Check it at 375px and 1280px: the figure widens on desktop, the at-a-glance list sits in the margin, and nothing scrolls sideways. Run `npm run e2e -- story && npm run check && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: story pages with figures, photo strips and click-to-play video`

### Task 4: About page, nav and redirects

**Files:**
- Create: `src/pages/about.astro`, `tests/e2e/about.spec.ts`
- Delete: `src/pages/academics.astro`, `src/pages/experience.astro`, `src/pages/achievements.astro`, `tests/e2e/academics-experience-achievements.spec.ts` (carry its still-valid checks over to `about.spec.ts`)
- Modify: `astro.config.mjs` (redirects), `src/components/Header.astro` (nav), `src/pages/index.astro` (old-hash map only), `tests/e2e/site.spec.ts`, `tests/e2e/home.spec.ts` (hash tests)

**Interfaces:**
- Consumes: `buildTimeline` (Task 2), `Entry` with `logo`/`date` and `Figure` (Task 3), `profile.about_opening` (Task 1)
- Produces: section ids `education`, `work`, `recognition`, `skills`, `talks` on `/about/`

- [ ] **Step 1: Write the failing e2e tests** in `about.spec.ts`:
  - one `h1` "About"
  - h2s in order: "Timeline", "Education", "Work", "Recognition", "Skills", "Talks and service", with a section omitted when its collection is empty
  - each timeline line links to its `href`
  - an education entry with `logo` shows an `img[alt=""]` inside that entry
  - experience `points` render as `p`, never `li`
  - awards with `story` link to `/projects/<story>/`
  - certificates list after awards
  - `/academics/` ends on `/about/#education`, `/experience/` on `/about/#work`, `/achievements/` on `/about/#recognition`
  - `/#education` → `/about/#education`, `/#leadership` and `/#industry` → `/about/#work`, `/#honors` and `/#certifications` → `/about/#recognition`
  - in `site.spec.ts`: the nav labels are exactly `['Research','Projects','Publications','Teaching','About','CV']`
- [ ] **Step 2:** Run `npm run e2e -- about site home`. Expected: FAIL.
- [ ] **Step 3:** Build `/about/` in the order the spec's "About page" gives:
  - opening `Prose`, only if `about_opening` is set
  - timeline grouped by year, the year in the margin
  - Education entries with logo, thesis title (linked to `/projects/<story>/` when `story` is set), supervisor, details and links
  - Work entries (all kinds, `recentFirst`) with logo, `points` as paragraphs, optional `Figure` and links
  - Recognition: awards by date with a thumbnail `Figure` if `image` is set, then certificates with a thumbnail if `image` is set
  - Skills as `label: items joined by " · "` lines
  - Talks and service from `activities`, with a `Video` when `video` is set

  Add the redirects (API confirmed with Context7), update the nav and the old-hash map, and delete the three old pages.
- [ ] **Step 4:** Run `npm run e2e && npm run check && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: About page replaces Academics, Experience and Achievements`

### Task 5: Home page

**Files:**
- Modify: `src/pages/index.astro`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: profile `now`, `now_date`, `audience_line`; featured projects; `Entry`/`Figure` (Task 3)

- [ ] **Step 1: Write the failing tests:**
  - "Now" h2 appears only when `now` is set, followed by "As of {formatYm(now_date)}" when `now_date` is set
  - "Selected work" lists featured projects by `order`, each row's heading linking to `/projects/<slug>/` when it has a published story, else to its first link, else unlinked
  - a row thumbnail shows only when `image` is set
  - "News" keeps its current behaviour
  - featured publications no longer appear on `/`
- [ ] **Step 2:** Run `npm run e2e -- home`. Expected: FAIL.
- [ ] **Step 3:** Build the page in this order: intro (photo, name, title, bio, text links, `audience_line` if set), Now, Selected work (image rows: 4:3 thumbnail about 11rem wide on the left, stacked on narrow screens, no borders), News.
- [ ] **Step 4:** Run `npm run e2e && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: home page with Now and Selected work`

**CHECKPOINT (orchestrator):** Start `npm run dev` in the session Terminal. Ask Mamun to look at `/`, `/about/` and `/projects/ecmx-transfer-learning/` (draft, visible in dev) on his laptop and on a phone-sized window. Apply his layout changes before Task 6, through the implementer, as one task with the same test-first steps.

### Task 6: Projects, Research, Publications and Teaching pages

**Files:**
- Modify: `src/pages/projects.astro`, `src/pages/research.astro`, `src/pages/publications.astro`, `src/components/PubEntry.astro`, `src/pages/teaching.astro`
- Test: `tests/e2e/projects-teaching.spec.ts`, `tests/e2e/publications.spec.ts`, `tests/e2e/research.spec.ts` (create if it doesn't exist)

- [ ] **Step 1: Write the failing tests:**
  - **Projects:** h2 "Research" then "Engineering", either omitted when empty. Rows within each group are sorted by `order`, then title. A row links to its story when it has a published one. A thumbnail shows only when `image` is set. Each row shows the role when `role` is set.
  - **Research:** "Questions I'm working on" h2 only when `questions` is non-empty, with one `li` per question. A theme with `image` shows a `figure`, and a theme with `story` links "Read the story" to `/projects/<story>/`. The featured publications section (moved from Home) comes last.
  - **Publications:** `plain` renders as a muted line under the title when set. "Slides" and "Video" links appear only when set.
  - **Teaching:** "Talks and training" h2 lists `activities` with `kind: talk` when there are any. Each `teachingPage.videos` item renders a `Video`.
- [ ] **Step 2:** Run `npm run e2e`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement with the Task 3 components. Project rows use the same image-row layout as Selected work on Home. Extract it into `src/components/WorkRow.astro`, used by both pages.
- [ ] **Step 4:** Run `npm run e2e && npm run check && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: media and story links on Projects, Research, Publications, Teaching`

### Task 7: Writing guards

**Files:**
- Modify: `tests/content-lint.test.ts` (banned list)
- Create: `tests/content-cv-overlap.test.ts`, `src/lib/overlap.ts`, `tests/lib/overlap.test.ts`

**Interfaces:**
- Produces `sharedRuns(a: string, b: string, n = 10): string[]`. Both inputs are lower-cased, punctuation is stripped (keep letters, digits and `%`, `.` inside numbers), and whitespace is collapsed. It returns each distinct n-word run of `a` that also occurs in `b`.

- [ ] **Step 1: Write the failing tests:**
  - `sharedRuns('one two three four five six seven eight nine ten eleven', 'x one two three four five six seven eight nine ten y')` → `['one two three four five six seven eight nine ten']`
  - nine shared words → `[]`
  - punctuation and case differences don't hide a match
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `sharedRuns`. In `content-cv-overlap.test.ts`, if `docs/sources/cv-academic.txt` or `cv-lecturer.txt` is missing, call `test.skip` with the note "CV sources not present (git-ignored); overlap check runs locally only". Otherwise check these prose fields in every YAML under `src/content/`: `bio`, `now`, `about_opening`, `audience_line`, `statement`, `summary`, `story`, `standfirst`, `points[]`, `description`, `caption`, `images[].caption`, `themes[].summary`, `questions[]`, `plain`, `outcome`. Report `file: field: run`. Add the new banned phrases to `content-lint.test.ts`.
- [ ] **Step 4:** Run `npm test`. Expected: the overlap test runs locally (`docs/sources/` exists here) and **is allowed to fail**, because today's content still copies the CV. Record the hit list in the task report for Task 8. The rest passes.
- [ ] **Step 5:** Commit: `test: CV-overlap guard and extended banned phrases` (mark the overlap test `test.fails` until Task 8 lands, with a `shortcut:` comment saying Task 8 removes the marker).

### Task 8: Copy rewrite (orchestrator)

- [ ] **Step 1:** Send Mamun the story questions, about 5 for each of the 3 stories: what the problem was, what he did versus the team, what went wrong, what he would change, and which photos, videos and PDFs he has. Also ask for logos, the "Now" paragraph facts, and his About opening in his own words.
- [ ] **Step 2:** Use the humanizer skill and the spec's "Writing" rules to draft, from his answers and existing facts only:
  - bio
  - `now`, `about_opening`, `audience_line`
  - research `questions`
  - the `plain` line for each publication
  - project summaries and standfirsts
  - experience `points` as prose
  - award and certificate descriptions
  - captions
  - the three stories
- [ ] **Step 3:** Show Mamun the drafts page by page in the dev server. Apply his edits. Set `draft: false` on stories he approves, and add `story: false-data-injection` to the B.Sc. education entry once that story exists.
- [ ] **Step 4:** Remove the `test.fails` marker. Run `npm test`. Expected: the overlap test PASSES with no hits. Update `docs/content-todo.md` with what is still missing.
- [ ] **Step 5:** Commit: `content: rewrite copy in Mamun's voice (approved by Mamun)`

### Task 9: QA and release (orchestrator)

- [ ] **Step 1:** Merge `main` into `redesign`. Convert any CMS edits that saved project `links` in the old shape (the schema accepts them, but the files should be migrated).
- [ ] **Step 2:** Add the overflow check to `tests/e2e/site.spec.ts`. For every route in `dist/` (including each story page), at 375px wide, `document.documentElement.scrollWidth <= 375`. Run `npm test && npm run check && npm run build && npm run e2e`. Expected: all PASS.
- [ ] **Step 3:** Dispatch the `reviewer` subagent for a whole-branch review against both specs. Fix its findings through the implementer.
- [ ] **Step 4:** Ask Mamun to approve the release. On his yes, merge into `main` and push. Confirm the Actions deploy finishes and that `https://mamunorrashid.me/about/` and `/academics/` (redirect) work.
- [ ] **Step 5:** Tell Mamun to close and reopen every CMS tab before editing again.
