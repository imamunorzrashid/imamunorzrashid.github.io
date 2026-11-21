# mamunorrashid.me: stories and media (design)

Date: 2026-11-22 · Owner: Mamun Or Rashid · Builds on `2026-11-20-portfolio-redesign-design.md`. Everything in that spec still holds unless this document changes it. Changes are listed under "Decisions this reverses".

## Intent

The redesigned site works, but it reads like the CV laid out as web pages. The menu uses the CV's section headings (Academics, Experience, Achievements), most sentences were copied from the CV, and every page repeats the same pattern: a title, a grey meta line, a bullet list. A reader gets nothing the PDF doesn't already give them.

Mamun wants a site that a supervisor or hiring panel actually enjoys browsing. It should show the work (university logos, project photos, the car, the boards, the thesis PDF, talk and demo videos) and be written the way he would explain it in person. It must stay academic. Too plain and it reads like a CV; too decorated and academics will read it as template or AI output.

Prior art: https://aquibazmain.github.io/ (read in full, 2026-11-22). What works there is that every claim has evidence right beside it (a PDF, a photo, a video), and some entries are personal first-person stories. What we don't take from it: the Bootstrap template look, a logo on every row, 14 scripts, and courses listed by semester.

## Goals

1. Proof beside each claim. Logos next to institutions, photos with projects, PDFs and slides with the thesis and papers, click-to-play videos.
2. Organise the site around the work, not the CV's headings (approach C, chosen by Mamun 2026-11-22): fewer menu items, and a page of its own for each of the 2–3 biggest pieces of work.
3. Rewritten copy in Mamun's voice. No site sentence repeats the CV's wording (a test enforces this, see "Writing").
4. Mamun adds all media himself through the CMS: upload a photo, paste a video URL, link a PDF. No code changes needed.
5. It stays quiet, typographic and fast. Visual interest comes from real photos, figures and layout rhythm, never from effects.

## Non-goals

- No blog, dark mode, analytics, lightbox library, carousel or search.
- No video hosting. Videos stay on YouTube or Facebook, and the site embeds them on click.
- No new fonts and no second accent colour.
- No story pages beyond what Mamun has written. A page exists only once its write-up exists.

## Anti-goals

All anti-goals from the 2026-11-20 spec still apply (gradients, shadows, card grids, eyebrow labels, animations, emoji, full-viewport hero, "Hi, I'm…"). In addition:
- A logo, photo or video placeholder with nothing behind it. Every media slot renders only when its field is filled.
- Images used as decoration (stock photos, abstract banners, icons as illustrations).
- Copy that sounds like a CV ("Designed X, integrating Y, compliant with Z") or like generated text (see "Writing").
- Layout tricks that hide content: tabs, accordions for main content, hover-only information. The existing abstract fold-out stays.

## Decisions this reverses (Mamun agreed by choosing C, 2026-11-22)

| 2026-11-20/21 spec | Now |
|---|---|
| "Organisation logos aren't used in the new design." | Logos appear on education and experience entries, the About page and the story meta block. |
| Third-party widgets: Flag Counter only. | Click-to-play YouTube (`youtube-nocookie.com`) and Facebook video embeds are allowed. Nothing loads from those services until the reader clicks play. YouTube poster thumbnails (`i.ytimg.com`) may load with the page. |
| 9-item nav: Home, Research, Publications, Projects, Academics, Experience, Achievements, Teaching, CV. | 6 items: Research, Projects, Publications, Teaching, About, CV. The name in the header links home. Gallery stays in the footer. |
| `/academics/`, `/experience/`, `/achievements/` pages. | Merged into `/about/`. The old URLs redirect to its sections. |

## Information architecture

| Route | What it shows |
|---|---|
| `/` | Photo, name, one-line title, short intro (rewritten bio, ≤ 120 words), one line for the two audiences (proposal: "If you're considering me for a PhD, start with my research. If you're hiring for teaching, see what I can teach."), **Now** (one dated paragraph on current work), **Selected work** (3 story rows with an image each, from `featured` projects), **News** (latest 5). Featured publications move to the Research page. |
| `/research/` | Statement, **Questions I'm working on** (new, see Ideas), themes. Each theme can show a figure and link to its story page. Ends with featured publications. |
| `/projects/` | Two groups: **Research** (`kind: research`) and **Engineering** (`kind: build`). Each row has a thumbnail, title, years, my role, and a 1–2 sentence summary. A row whose project has a story links to `/projects/<slug>/`; otherwise it links to its first external link. |
| `/projects/<slug>/` | Story page. Generated only for projects whose `story` field is filled. See "Story page". |
| `/publications/` | As now, plus an optional plain-language one-liner per paper, and Slides and Video links when set. |
| `/teaching/` | As now (statement and courses), plus optional videos (e.g. a recorded lecture or the EV-motors talk) and the training/talks Mamun has given, pulled from `activities` (`kind: talk`). |
| `/about/` | See "About page". |
| `/cv/` | Unchanged. |
| `/gallery/` | Unchanged, linked from the footer. |

Redirects (Astro `redirects` config; check the current API with Context7): `/academics/` → `/about/#education`, `/experience/` → `/about/#work`, `/achievements/` → `/about/#recognition`. The old-hash map on `/` changes to match: `#education` → `/about/#education`, `#leadership` and `#industry` → `/about/#work`, `#honors` and `#certifications` → `/about/#recognition`.

## Story page (approach C)

The first three stories, chosen because they carry the most material and matter most to the two audiences:
1. **The B.Sc. thesis**, cyber-resilient frequency support (`kind: research`). Thesis PDF, defence slides, the pre-defence photo already in the gallery.
2. **Transfer learning for frequency control**, the ECMX paper (`kind: research`). Methodology figure (`public/images/research/ecmx-methodology.webp`, currently unused), OPAL-RT setup photo, paper link.
3. **The electrical system of the Formula SAE EV** (`kind: build`). Car and accumulator photos, the FSAE Japan 2025 video, FMEA/ESF documents if they can be shared.

Layout, top to bottom:

```
← All projects
Electrical system of a Formula SAE electric car            (h1)
A 72 V battery pack, a safety circuit, and a first-time     (standfirst, 1–2 sentences, muted)
pass at FSAE Japan's electrical inspection.

┌────────────────────────── wide figure (up to 60rem) ──────────────────────────┐
│                                photo or figure                                 │
└────────────────────────────────────────────────────────────────────────────────┘
Fig. 1. The accumulator on the bench before scrutineering, Nagoya, 2025.

  Role       Chief of Data Acquisition Systems        ← "at a glance" list. Sits in the
  Team       Team Crack Platoon, RUET                    right margin on wide screens and
  Period     2023 – 2025                                 inline above the text on narrow
  Tools      KiCad, LTspice                              ones. 1px rule on its left, no
  Outcome    Passed electrical inspection first try      box.

Story text (Markdown, Mamun's headings). The CMS hint suggests four:
  What the problem was · What I did · What went wrong · What I'd do differently

[photo] [photo] [photo]      ← photo strip, wraps on narrow screens; each image links to the full file
caption  caption  caption

▶ Watch: run at FSAE Japan 2025 (Facebook)      ← click-to-play video

Documents and links: Thesis (PDF) · Slides (PDF) · Code · Paper
─────────────────────────────────────────
← Previous story                Next story →
```

The "at a glance" values are fields, not prose (`role`, `team`, `start`/`end`, `tools`, `outcome`). Figures inside a story are numbered in order (Fig. 1, Fig. 2, …), including the lead image and the strip.

## About page (`/about/`)

Replaces Academics, Experience and Achievements. It covers the same facts, ordered so it reads as a path rather than a form.

1. **Opening** (2–3 sentences, written with Mamun: where he comes from and how he got into control and energy systems. TODO(Mamun): his own words, no invented facts).
2. **Timeline** (generated, no extra content): one line per dated item across education, experience, awards and publications, grouped by year, newest first. Each line links to its entry below or to its story. For example: `2025 · Passed electrical inspection at FSAE Japan on the first attempt → story`.
3. **Education** (`#education`): logo, degree, institution, years, thesis title linking to the thesis story, supervisor, CGPA and rank, and links (thesis PDF, curriculum). HSC and SSC each take one compact line, with a logo if one is provided.
4. **Work** (`#work`): research, team and industry roles. Logo, role, organisation, years, 1–3 sentences of prose (not bullets), optional photo, links.
5. **Recognition** (`#recognition`): awards with the year in the margin, an optional photo thumbnail (e.g. `public/images/awards/irdc.webp`, currently unused), and a link to the related story when set. Certificates follow as a short list, with a thumbnail when an image is set (the four existing `public/images/certificates/*.webp`).
6. **Skills**: the existing skills groups, as compact lines.
7. **Talks and service**: from `activities`.

## Visual design

The type system and palette stay as they are: Source Serif 4 and IBM Plex Sans, ink, muted, rule, white, and the one navy accent. What changes is rhythm and media:

- **Two widths.** Text stays in the 44rem reading column. Figures, the photo strip and story lead images may widen to 60rem on screens ≥ 64rem. This is the main thing that breaks the CV-like monotony.
- **Hanging dates.** On list pages (About, Projects, News) at ≥ 64rem, dates sit in the left margin in small sans with tabular numerals. Below that width, dates sit inline above the title.
- **Image rows, not cards.** Project and selected-work rows have a 4:3 thumbnail (about 11rem wide) on the left and text on the right. No border, shadow or background, with whitespace between rows. On narrow screens the image stacks above the text.
- **Logos** are 40px, full colour, aligned to the first line of the entry, with an empty `alt` (the institution name is right beside them). Uploaded as PNG, SVG or WebP.
- **Figures** use `<figure>` and `<figcaption>`, with captions in 0.9rem sans muted. A very light neutral tint (`--figure-bg: #f5f5f3`) sits behind transparent diagrams and video posters so they don't float. This is a flat colour, not a gradient.
- **Video** (`Video.astro`): a 16:9 poster (the uploaded poster, or the YouTube thumbnail) with a plain play button and the title. Clicking replaces it with the iframe and starts playback. Without JavaScript it's an ordinary link. Facebook videos without a poster render as a text link with ▶. Supported URL forms: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, YouTube playlists, `facebook.com/watch/?v=`, `facebook.com/<page>/videos/<id>`. Anything else renders as a plain link.
- **Hover:** links underline and nothing moves. No zoom, fade or reveal.
- All image fields require alt text, enforced by the schema (as now).

## Writing

The copy rewrite is the orchestrator's job (as Task 9 was), using the humanizer skill, and Mamun approves it. Rules:

1. **Explain it like you would to a professor across a table.** First person, plain verbs, past tense for finished work, present tense for ongoing work.
2. **Specific over general.** Name the part, the number, the tool, the place: "twenty cells in series, two in parallel" rather than "high-voltage accumulator design".
3. **Say what you did and what the team did.** Team projects state his part plainly.
4. **Vary the rhythm.** Mix short and long sentences. No reflexive lists of three, no "not only X but also Y", no closing one-line morals, no rhetorical-question openers, and no em dashes used as a habit.
5. **Leave room for what went wrong.** Each story has an honest "what went wrong / what I'd change" part. Academics trust this more than polish.
6. **Captions say something:** "The accumulator before scrutineering, Nagoya, 2025", not "Accumulator".
7. **No invented facts.** Details only Mamun knows (what failed, what a moment was like) come from a short question list sent to him for each story. Gaps stay `TODO(Mamun)` and go into `docs/content-todo.md`.
8. **Banned phrases** keep the 2026-11-20 list and add: `journey`, `landscape`, `testament`, `pivotal`, `meticulous`, `showcase`, `realm`, `foster`, `at the intersection of`, `deeply`, `I am excited`, `in today's`. Publication and course titles are exempt.
9. **Not the CV, enforced by a test** (new): `tests/content-cv-overlap.test.ts` fails if any prose field in `src/content/**` shares a run of 10 or more consecutive words (lower-cased, punctuation stripped) with `docs/sources/cv-academic.txt` or `cv-lecturer.txt`. Prose fields: bio, statements, summaries, stories, points, descriptions, captions, opening, now. Titles, thesis titles, course names, venues and author lists are exempt.

## Ideas added (Mamun invited new ideas, 2026-11-22; each is a proposal he can cut)

1. **Questions I'm working on** (Research page): 2–4 open questions in plain words, drawn from his research statement, e.g. "How little clean data does a frequency controller need before it can be trusted on a new grid?" Supervisors read this as how he thinks. Field: `research.yaml` `questions: [str]`.
2. **Plain-language line per paper** (Publications): one sentence a non-specialist can follow, under the title. Field: `plain: str?`.
3. **Generated timeline** on About (above): the path at a glance, with no extra content to maintain.
4. **Now** paragraph on Home, with a visible "as of" month, so the site visibly stays current. Fields: `profile.now: md?`, `profile.now_date: ym?`.
5. **Previous/next between stories**, so a reader who finishes one keeps going.
6. **CV-overlap test** (above), so the site can't slide back into copying the CV.

## Content model changes

Shorthand as in the 2026-11-20 spec. New shared shapes:
- `link` = `{label: str, url: str}`. `url` may be site-relative (`/docs/thesis.pdf`) or absolute.
- `img` = `{src: str, alt: str (min 1), caption: str?}`
- `video` = `{url: url, title: str, poster: str?}`

| Collection | Change |
|---|---|
| **profile** | add `now: md?`, `now_date: ym?`, `about_opening: md?`, `audience_line: md?` |
| **researchPage** | add `questions: [str]`; each theme gains `image: img?` and `story: str?` (a project slug) |
| **teachingPage** | add `videos: [video]` |
| **projects** | add `kind: research\|build` (default `build`), `role: str?`, `team: str?`, `tools: [str]`, `outcome: str?`, `standfirst: str?`, `story: md?`, `images: [img]`, `videos: [video]`. **`links` changes from `{code?, paper?, demo?}` to `[link]`**; migrate the 4 existing files. The old `image`/`image_alt` become the thumbnail and lead image (kept as fields). |
| **education** | add `logo: str?`, `links: [link]`, `story: str?` (slug of the thesis story) |
| **experience** | add `logo: str?`, `image: img?`, `links: [link]`. `points` stays (rendered as prose sentences, not bullets). |
| **publications** | add `plain: str?`, `slides: str?`, `video: url?` |
| **awards** | add `image: img?`, `story: str?` |
| **certificates** | add `image: img?` |
| **activities** | add `video: url?` |

A `story` slug that doesn't match an existing project with a story fails the build (a content test). Uploads: images go to `public/images/uploads/` (as now), and PDFs go to `public/docs/` through a CMS file widget whose `media_folder` is that folder (or a full URL, e.g. Google Drive). PDFs: ≤ 10 MB each, kebab-case names.

The CMS (`public/admin/config.yml`) gets a form field for every new field, with hints. The project form's `story` field hint lists the four suggested headings. `tests/cms-config.test.ts` keeps checking that the CMS and the schema match.

## Build order (proposal for the plan)

1. Schema, CMS and migration of `links` (no visual change).
2. Components: `Figure`, `PhotoStrip`, `Video`, `Logo`, `AtAGlance`, `MarginDate`. One sample story page built from existing content, plus the About page and the redirects.
3. **Checkpoint:** Mamun looks at Home, About and one story page in the browser before the rest is built.
4. The remaining pages (Projects, Research, Publications, Teaching).
5. Copy: the question list goes to Mamun, then the orchestrator drafts and Mamun approves. CV-overlap test and extended banned list.
6. Update the e2e tests for the new routes and redirects. Full review.

## Calls settled after the builder check (orchestrator's calls, Mamun can overrule)

1. **Research project files and the checkpoint sample.** Step 1 creates `projects` entries for the thesis and the ECMX paper (`kind: research`). Their `summary` and at-a-glance fields come only from facts already in the repo (the thesis title, supervisor and dates in `education`; the ECMX theme in `research.yaml`, written by Mamun; the publication entry). `story` stays empty until Mamun answers the story questions, so neither has a story page yet. The checkpoint sample is the **ECMX story**: its body is built from Mamun's own research-theme text plus the methodology figure, and is marked as a layout draft. The story is not published until Mamun approves its copy in step 5.
2. **The CV-overlap test runs locally only.** `docs/sources/` is git-ignored on purpose (the CVs hold his phone number), so the test skips with a console note when the CV `.txt` files are missing. CI never sees them. Every content commit is made on this laptop with `npm test`, which is where the guard runs. Shortcut: switch to committed hashed 10-word fingerprints if editing ever moves off this laptop.
3. **Release in one merge.** All work happens on `redesign` and ships to `main` once, after Mamun approves the whole thing. Mamun may keep editing in the CMS during the build (those edits land on `main`). Before shipping, `main` is merged into `redesign`, and any CMS edits to project `links` are migrated by hand. After the release, Mamun closes every CMS tab and reopens it, because a stale tab would save the old `links` shape.
4. **Timeline sources.** One line per item:
   - education: degree, dated by `end` (or `start` while ongoing)
   - experience: role and organisation, dated by `start`
   - awards: title, dated by `date`
   - publications with a `year`: title and venue
   - projects that have a story: title (and `outcome` when set), dated by `end`

   Items without a usable date are left out. Within a year, items follow that order.
5. **Home audience line** becomes a field, `profile.audience_line: md?`. Its wording is copy, so it waits for Mamun's approval in step 5. Until then the field is empty and nothing renders.

## Left to the builder

Component file names, exact spacing values, the breakpoint for the margin layout (around 64rem), how the video script is written (one small inline script, no dependency), the exact timeline grouping markup, and the Playwright test details.

## What Mamun provides (goes into `docs/content-todo.md`)

- Logos: RUET, University of Wollongong, Team Crack Platoon, Walton, and optionally the two schools. PNG/SVG, any size.
- For each of the three stories: photos, video URLs, PDFs (thesis, slides, FMEA/ESF if shareable), and answers to the story questions.
- Optional: an OPAL-RT setup photo, a recorded talk or lecture video, the plain-language line for each paper.
