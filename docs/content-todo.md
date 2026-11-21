# Content to-do for Mamun

Every `TODO(Mamun)` in `src/content/` is listed here with its file and what is needed. Items below marked "decided" record a choice already made, for reference.

## Content to add

- [ ] Abstracts: paste each paper's abstract into its Abstract field in the CMS (Publications); it appears as a fold-out under the paper.
- [ ] ECMX story (`src/content/projects/ecmx-transfer-learning.yaml`): `TODO(Mamun)` answers to the story questions. The story is the research theme text plus a layout draft, and the project stays `draft: true` until Mamun approves the copy.
- [ ] Project roles (`src/content/projects/ecmx-transfer-learning.yaml` and `false-data-injection.yaml`): both are set to "First author", with team "EPIC Research Group, RUET". Confirm both.
- [ ] About opening (`about_opening` in `src/content/pages/profile.yaml`): `TODO(Mamun)` 2–3 sentences in his own words on where he comes from and how he got into control and energy systems. The field is empty, so nothing shows at the top of `/about/` until it is written.
- [ ] Talk photo caption (`images` on `src/content/activities/driving-innovation-ev-motors.yaml`): `TODO(Mamun)` a caption for the seminar photo, saying where and when it was taken. It is empty, so the photo shows only its figure label.
- [ ] About logos (`logo` on education and work entries): the University of Wollongong logo is still missing, for the Wollongong research entry (`src/content/experience/undergraduate-researcher-university-of-wollongong.yaml`). RUET, Team Crack Platoon and Walton are set. Optionally the HSC and SSC schools, PNG or SVG. An entry shows no logo until its field is set.
- [ ] Education story link (`story` on the B.Sc. entry in `src/content/education/bsc-mechatronics-engineering.yaml`): empty until the false-data-injection story is written, so the thesis title is not yet linked.

## Files and assets

- [ ] Gallery: three `.HEIC` photos have no entry because they cannot be optimised: `formula japan 2025.HEIC`, `industrial attachment presentation.HEIC`, `industrial attachment presentation 2.HEIC`. Export them as JPG if they should appear, then run `scripts/optimize-images.mjs` on them.
- [ ] `public/images/gallery/class-representative-award.webp`: the source was 12.7 MB and is now 82 KB at 1600 px. Confirm the optimised version looks right.
- [ ] Gallery alt text was written from the photos themselves. Check the 11 alt texts in `src/content/gallery/` against the photos.

## Facts to confirm

- [ ] Next Energy paper (`src/content/publications/next-energy-cyber-resilient-frequency-control.yaml`): the CVs say accepted; the old site says "Under review". The site uses accepted with no year. Add the year once known.
- [ ] Student of the Year (`src/content/awards/student-of-the-year-2026.yaml`): the old site says "CGPA 4.00/4.00"; both CVs say SGPA 4.00/4.00. The site uses the CV wording (SGPA).
- [ ] Formula Bharat static award (`src/content/awards/formula-bharat-static-2024.yaml`): the old site says "15th overall static result"; the CV says "15th in static; 16th overall out of 37 teams". The site uses the CV.
- [ ] Thesis title: the old site says "Isolated Network Microgrids"; both CVs say "Isolated Networked Microgrids". The site uses the CV wording.
- [ ] Embedded certificate (`src/content/certificates/embedded-systems-bare-metal-stm32.yaml`): the old site says "Advanced Embedded Systems Bare-Metal Programming"; the CV says "Embedded Systems Bare-Metal Programming Ground Up™ (STM32)". The site uses the CV title.
- [ ] Dates on projects: the BSPD and LMQ converter projects have no dates in the sources. They have none on the site. Provide dates if they should show.

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
- Class rank: 3rd of 59. The CV PDFs now say 3rd of 59 and Head of Electrical May – July 2026. (Mamun, 2026-11-21)
- ResearchGate link added. (Mamun, 2026-11-20)
- Interests and skills are from the academic CV.
- The Flag Counter is dropped. (Superseded on 2026-11-21, see below.)
- The old Google Drive CV link and `legacy/assets/Mamun_Or_Rashid_CV.pdf` are superseded and not copied.
- CV downloads: `cv_academic` and `cv_lecturer` link to Google Drive. Mamun replaced both files' contents with web versions that have no References and no phone number, and checked that the links open the new versions. (Mamun, 2026-11-20)
- Profile photo: Mamun's upload `/images/uploads/passport-size-photo.webp`. (Mamun, 2026-11-20)
- Profile title and affiliation: title `B.Sc. in Mechatronics Engineering`; affiliation `Rajshahi University of Engineering & Technology (RUET)`. He has graduated, so the "Department of …" wording no longer fits. (Mamun, 2026-11-20)
- Seeking line: "Open to PhD positions starting in Fall 2027". Mamun added it. (Mamun, 2026-11-20) This replaces the earlier decision that it was not wanted.
- VC's List and Technical Scholarship 2021 – 2024: both are correct. The academic session is 2020-21 to 2023-24, and classes started in 2022 because of COVID. Keep 2021 – 2024. (Mamun, 2026-11-20)
- Head of Electrical: May – July 2026. (Mamun, 2026-11-20)
- KiCad 9 certificate: Udemy, June 2025, URL confirmed. (Mamun, 2026-11-20)
- PADV review: removed for now. `src/content/publications/physics-aware-dynamic-virtualization-review.yaml` is deleted. (Mamun, 2026-11-20)
- Featured publications: the two journal papers (ECMX and Next Energy). (Mamun, 2026-11-20)
- News: the Next Energy acceptance on 9 Nov 2026, in `src/content/news/2026-11-next-energy-accepted.yaml`. (Mamun, 2026-11-20)
- FSAE and rover demo links: the academic CV links are fine. (Mamun, 2026-11-20)
- CV page shows only the download links: the Academic CV and the Teaching CV (Mamun, 2026-11-21).
- Research theme 2 is correct: the 50% data-scarcity and packet-loss tests were run on the six-area network. (Mamun, 2026-11-21)
- Teaching department renamed to "Mechatronics Engineering"; this is intended. (Mamun, 2026-11-21)
- Rover drivetrain project removed from the site. (Mamun, 2026-11-21)
- Research theme titles: the three research themes use new titles (data-efficient frequency control with transfer learning; cyber-resilient control against false data injection; low-leakage transformerless PV inverters). (Mamun, 2026-11-21)
- Short experience texts: each experience entry shows one short paragraph (or a bulleted list for two or more points), and the Mamun-edited experience files are kept as saved in the CMS. (Mamun, 2026-11-21)
- Link icons: each social link has a small monochrome icon before its text label, never icon-only. Icons are Simple Icons v13.21.0 (CC0). (Mamun, 2026-11-21)
- Home CV link: an Academic CV link is on the home page links row, from `cv_academic`. (Mamun, 2026-11-21)
- Flag Counter: the footer shows the existing counter (ID `jXJ4`, from the old site), so counts carry over. It is hidden when `flag_counter` is empty. (Mamun, 2026-11-21)
