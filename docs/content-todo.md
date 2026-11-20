# Content to-do for Mamun

Every `TODO(Mamun)` in `src/content/` is listed here with its file and what is needed. Items below marked "decided" record a choice already made, for reference.

## Missing text in the content

- [ ] `src/content/pages/profile.yaml` `title`: no source gives a title line. Provide the title shown under the name.
- [ ] `src/content/pages/research.yaml` `statement`: the old site has no Research section. Provide the research statement.
- [ ] `src/content/pages/research.yaml` `themes`: left as an empty list. Provide research themes (title and summary each), or leave empty.
- [ ] `src/content/pages/teaching.yaml` `statement`: provide the teaching statement.
- [ ] `src/content/certificates/advanced-pcb-design-kicad-9.yaml` `issuer`: not in the old site or the CVs. Provide the issuer.
- [ ] `src/content/certificates/advanced-pcb-design-kicad-9.yaml` `date`: set to `'2026'` as a placeholder (`# TODO(Mamun): date unknown`). Provide the year.
- [ ] `src/content/publications/physics-aware-dynamic-virtualization-review.yaml` `venue`: the target venue is unknown. Provide it.
- [ ] Same file, `type`: set to `journal` as an assumption (`# TODO(Mamun): confirm journal or preprint`). Confirm.
- [ ] Same file, `authors`: the old site lists only "M. O. Rashid, et al.". Provide the full author list, or confirm `et al.` stays.

## Files and assets

- [ ] `src/content/pages/profile.yaml` `cv_academic` and `cv_lecturer` are unset. `docs/sources/cv-academic-web.pdf` and `docs/sources/cv-lecturer-web.pdf` do not exist. Export the web versions (no references, no phone number) so they can be copied to `public/cv/mamun-or-rashid-cv-academic.pdf` and `public/cv/mamun-or-rashid-cv-teaching.pdf`, then set both fields.
- [ ] Gallery: three `.HEIC` photos have no entry because they cannot be optimised: `formula japan 2025.HEIC`, `industrial attachment presentation.HEIC`, `industrial attachment presentation 2.HEIC`. Export them as JPG if they should appear, then run `scripts/optimize-images.mjs` on them.
- [ ] `public/images/gallery/class-representative-award.webp`: the source was 12.7 MB and is now 82 KB at 1600 px. Confirm the optimised version looks right.
- [ ] Gallery alt text was written from the photos themselves. Check the 11 alt texts in `src/content/gallery/` against the photos.

## Facts to confirm

- [ ] `src/content/education/bsc-mechatronics-engineering.yaml` starts `2022`, but both CVs list the VC's List and Technical Scholarship as 2021 – 2024, and the old site's education card shows "2021 — 2024". Confirm the years for `src/content/awards/vc-list.yaml` and `src/content/awards/technical-scholarship.yaml`.
- [ ] Head of Electrical: the academic CV says 2025 – 2026, the lecturer CV says 2026, and the old site says 2025 – PRESENT. The site uses 2026 only (Mamun's decision, `src/content/experience/head-of-electrical-team-crack-platoon.yaml`). Fix the academic CV PDF to match.
- [ ] Next Energy paper (`src/content/publications/next-energy-cyber-resilient-frequency-control.yaml`): the CVs say accepted; the old site says "Under review". The site uses accepted with no year. Add the year once known.
- [ ] Student of the Year (`src/content/awards/student-of-the-year-2026.yaml`): the old site says "CGPA 4.00/4.00"; both CVs say SGPA 4.00/4.00. The site uses the CV wording (SGPA).
- [ ] Formula Bharat static award (`src/content/awards/formula-bharat-static-2024.yaml`): the old site says "15th overall static result"; the CV says "15th in static; 16th overall out of 37 teams". The site uses the CV.
- [ ] Thesis title: the old site says "Isolated Network Microgrids"; both CVs say "Isolated Networked Microgrids". The site uses the CV wording.
- [ ] Embedded certificate (`src/content/certificates/embedded-systems-bare-metal-stm32.yaml`): the old site says "Advanced Embedded Systems Bare-Metal Programming"; the CV says "Embedded Systems Bare-Metal Programming Ground Up™ (STM32)". The site uses the CV title.
- [ ] Project link for Formula SAE electrical system (`src/content/projects/electrical-system-formula-sae-ev.yaml` `demo`): the academic CV links to `facebook.com/watch/?v=1127887169236901`; the lecturer CV links to `facebook.com/share/v/19jWQNqT8u/`. The site uses the academic CV link. Confirm.
- [ ] Project link for the rover drivetrain (`src/content/projects/rover-drivetrain-irdc-2025.yaml` `demo`): the academic CV links to `facebook.com/photo/?fbid=2241915672617154`; the lecturer CV links to `facebook.com/share/p/1ENA3S1ZoC/`. The site uses the academic CV link. Confirm.
- [ ] Dates on projects: the BSPD, LMQ converter and rover projects have no dates in the sources (the rover title says 2025). They have none on the site. Provide dates if they should show.

## Not migrated (Mamun to decide)

- [ ] Old site: "Electrical Team Member, 2022 — 2023 (15th overall static result)" under Leadership. It is not in either CV and is not on Mamun's keep list, so it is not migrated.
- [ ] Old site: commented-out projects (Arduino Nano V3 clone in KiCad, DC motor speed control, industrial robotic arm prototype, ultrasonic rat repellent, Luhn card validator, Integrated Hall Management System). Not migrated.
- [ ] Old site: "I am interested in PhD opportunities…" contact paragraph. No CV states a "seeking" line, so `profile.seeking` is omitted. Provide wording if you want it on the site.
- [ ] News: Mamun to supply items. No dated news event is stated in the sources. `src/content/news/` is empty, so the build prints a warning.
- [ ] Teaching experience: the CVs list no teaching roles. The lecturer CV's recruit training and lectures sit under Team Crack Platoon leadership and are not counted here. Provide teaching entries, or confirm there are none. `src/content/teaching/` is empty, so the build prints a warning.
- [ ] Old site photos `seminar.jpg` and `walton.jpg` in `legacy/assets/images/activities/` are not migrated. The Walton photo is in the gallery.
- [ ] Optimised images with no YAML field: `public/images/research/ecmx-methodology.webp`, `public/images/awards/irdc.webp`, `public/images/projects/arduino.webp` (only in the commented-out legacy project), and the four `public/images/certificates/*.webp`. The schemas have no image field for these. Decide whether to keep them.

## Decided (for reference)

- `profile.bio` is the lecturer CV "Research & Teaching Profile" paragraph, verbatim, as the starting point for Task 9.
- Interests and skills are from the academic CV.
- The Flag Counter is dropped.
- The old Google Drive CV link and `legacy/assets/Mamun_Or_Rashid_CV.pdf` are superseded and not copied.
- The profile photo is the GitHub avatar at 460 px (`public/images/profile.jpg`).
