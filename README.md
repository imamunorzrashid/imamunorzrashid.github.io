# Mamun Or Rashid — PhD Research Portfolio

A responsive static research portfolio prepared for GitHub Pages.

## Deploy in minutes

1. Create a new public GitHub repository, e.g. `imamunorzrashid.github.io`.
2. Upload all files and folders from this project to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.

If the repository is named `imamunorzrashid.github.io`, the portfolio will be served from your user GitHub Pages domain.

## Before publishing

Search `index.html` for:
- `Replace with your LinkedIn profile URL`
- `Replace with your ORCID profile URL`

Replace the `href="#"` values with your exact profile links.

Also replace the generic Google Scholar URL with your exact Scholar profile URL.

## Files

- `index.html` — site content
- `style.css` — visual design and responsive layout
- `script.js` — reveal animations, counters, navigation, scroll progress
- `assets/Mamun_Or_Rashid_CV.pdf` — CV

## Recommended next upgrade

Add an `assets/images/` folder with:
- MMG topology
- Domain adaptation framework
- Best frequency-response comparison
- OPAL-RT setup
- Six-MGU topology
- BSPD PCB render / physical PCB
- Formula SAE team or vehicle photo

Then replace selected text-only research/project blocks with those figures.


## Updated V1
This edition preserves the original single-page V1 design while integrating the V2.1 profile content:
education history, additional projects, honors and awards, technical session, selected certifications, and expanded research profile.


## Refined V1 update
- Reordered sections for a research-first PhD portfolio flow.
- Added verified Google Scholar, GitHub, and LinkedIn links.
- Separated About and Education.
- Unified RUET, college, and high-school education styling.
- Added two selected research figures without converting the site into a gallery.

## Refined V2 fixes
- Fixed Education overlap caused by a legacy CSS selector.
- Constrained selected research figures to the content width and viewport.
- Converted certification entries to 50/50 certificate-preview/detail cards.
- Converted project entries to 50/50 image/detail cards with explicit image placeholders.
- Added a right-side visual slot for the technical session.
- Added scroll-spy navigation highlighting.

## Refined V3
- Cache-busted CSS/JS to prevent GitHub Pages from serving the old card layout.
- Compact certificate cards in a 2-column grid with 50/50 clickable thumbnail/details.
- Compact projects in a 3-column grid with 50/50 image/details.
- Separated honors into discrete award cards.
- Replaced text-only social links with icon buttons.
- Rebuilt active-section navigation tracking using IntersectionObserver.
- Added a styled footer slot for a unique Flag Counter embed.
