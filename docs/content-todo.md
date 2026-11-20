# Content to-do for Mamun

Every `TODO(Mamun)` in `src/content/` is listed here with its file and what is needed. Items below marked "decided" record a choice already made, for reference.

## Missing text in the content

- [ ] `src/content/pages/teaching.yaml` `statement`: provide the teaching statement. (Mamun, 2026-11-20: extract it from his CVs. The orchestrator drafts it in Task 9.)

## Files and assets

- [ ] Web CV links: the Google Drive CV links Mamun added on 2026-11-20 contain his phone number, so they are not linked. Export versions without References and phone, then set `cv_academic` / `cv_lecturer` in `src/content/pages/profile.yaml`. The copies go to `public/cv/mamun-or-rashid-cv-academic.pdf` and `public/cv/mamun-or-rashid-cv-teaching.pdf`.
- [ ] Gallery: three `.HEIC` photos have no entry because they cannot be optimised: `formula japan 2025.HEIC`, `industrial attachment presentation.HEIC`, `industrial attachment presentation 2.HEIC`. Export them as JPG if they should appear, then run `scripts/optimize-images.mjs` on them.
- [ ] `public/images/gallery/class-representative-award.webp`: the source was 12.7 MB and is now 82 KB at 1600 px. Confirm the optimised version looks right.
- [ ] Gallery alt text was written from the photos themselves. Check the 11 alt texts in `src/content/gallery/` against the photos.

## Facts to confirm

- [ ] Next Energy paper (`src/content/publications/next-energy-cyber-resilient-frequency-control.yaml`): the CVs say accepted; the old site says "Under review". The site uses accepted with no year. Add the year once known.
- [ ] Student of the Year (`src/content/awards/student-of-the-year-2026.yaml`): the old site says "CGPA 4.00/4.00"; both CVs say SGPA 4.00/4.00. The site uses the CV wording (SGPA).
- [ ] Formula Bharat static award (`src/content/awards/formula-bharat-static-2024.yaml`): the old site says "15th overall static result"; the CV says "15th in static; 16th overall out of 37 teams". The site uses the CV.
- [ ] Thesis title: the old site says "Isolated Network Microgrids"; both CVs say "Isolated Networked Microgrids". The site uses the CV wording.
- [ ] Embedded certificate (`src/content/certificates/embedded-systems-bare-metal-stm32.yaml`): the old site says "Advanced Embedded Systems Bare-Metal Programming"; the CV says "Embedded Systems Bare-Metal Programming Ground Up™ (STM32)". The site uses the CV title.
- [ ] Dates on projects: the BSPD, LMQ converter and rover projects have no dates in the sources (the rover title says 2025). They have none on the site. Provide dates if they should show.

## Not migrated (Mamun to decide)

- [ ] Old site: "Electrical Team Member, 2022 — 2023 (15th overall static result)" under Leadership. It is not in either CV and is not on Mamun's keep list, so it is not migrated.
- [ ] Old site: commented-out projects (Arduino Nano V3 clone in KiCad, DC motor speed control, industrial robotic arm prototype, ultrasonic rat repellent, Luhn card validator, Integrated Hall Management System). Not migrated.
- [ ] B.Sc. coursework "[Detailed Course Curriculum]" link (https://www.mte.ruet.ac.bd/page/course-curriculum) is not migrated, because the education schema has no link field. Should it go in `details` of `src/content/education/bsc-mechatronics-engineering.yaml` as text, or be left out?
- [ ] Teaching experience: the CVs list no teaching roles. The lecturer CV's recruit training and lectures sit under Team Crack Platoon leadership and are not counted here. Provide teaching entries, or confirm there are none. `src/content/teaching/` is empty, so the build prints a warning.
- [ ] Old site photos `seminar.jpg` and `walton.jpg` in `legacy/assets/images/activities/` are not migrated. The Walton photo is in the gallery.
- [ ] Optimised images with no YAML field: `public/images/research/ecmx-methodology.webp`, `public/images/awards/irdc.webp`, `public/images/projects/arduino.webp` (only in the commented-out legacy project), and the four `public/images/certificates/*.webp`. The schemas have no image field for these. Decide whether to keep them.

## Decided (for reference)

- Profile title and bio: written by Mamun. (Mamun, 2026-11-20) The bio replaces the lecturer CV paragraph used earlier.
- Research statement and themes: written by Mamun. (Mamun, 2026-11-20)
- Class rank: 3rd of 59. Both CV PDFs still say 58; Mamun to fix the PDFs. (Mamun, 2026-11-20)
- ResearchGate link added. (Mamun, 2026-11-20)
- Interests and skills are from the academic CV.
- The Flag Counter is dropped.
- The old Google Drive CV link and `legacy/assets/Mamun_Or_Rashid_CV.pdf` are superseded and not copied.
- The profile photo is the GitHub avatar at 460 px (`public/images/profile.jpg`).
- Profile title and affiliation: title `B.Sc. in Mechatronics Engineering`; affiliation `Rajshahi University of Engineering & Technology (RUET)`. He has graduated, so the "Department of …" wording no longer fits. (Mamun, 2026-11-20)
- Seeking line: "Open to PhD positions starting in Fall 2027". Mamun added it. (Mamun, 2026-11-20) This replaces the earlier decision that it was not wanted.
- VC's List and Technical Scholarship 2021 – 2024: both are correct. The academic session is 2020-21 to 2023-24, and classes started in 2022 because of COVID. Keep 2021 – 2024. (Mamun, 2026-11-20)
- Head of Electrical: May – July 2026. (Mamun, 2026-11-20)
- KiCad 9 certificate: Udemy, June 2025, URL confirmed. (Mamun, 2026-11-20)
- PADV review: removed for now. `src/content/publications/physics-aware-dynamic-virtualization-review.yaml` is deleted. (Mamun, 2026-11-20)
- Featured publications: the two journal papers (ECMX and Next Energy). (Mamun, 2026-11-20)
- News: the Next Energy acceptance on 9 Nov 2026, in `src/content/news/2026-11-next-energy-accepted.yaml`. (Mamun, 2026-11-20)
- FSAE and rover demo links: the academic CV links are fine. (Mamun, 2026-11-20)
