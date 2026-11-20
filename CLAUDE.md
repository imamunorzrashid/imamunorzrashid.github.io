# mamunorrashid.me

Personal academic site for Mamun Or Rashid. It serves two audiences: PhD supervisors and admission committees, and lecturer hiring panels.

- Spec: `docs/superpowers/specs/2026-11-20-portfolio-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-11-20-portfolio-redesign.md`

## Roles

- **This main session is the orchestrator (Opus).** It plans, dispatches and reviews, and it talks to Mamun.
- Implementation goes to the `implementer` subagent (Haiku). Reviews go to the `reviewer` subagent (Opus).
- **Never pass a `model` parameter when dispatching a subagent.** A per-call model overrides the agent file's `model`.
- Give each implementer dispatch the full text of its task, the Global Constraints, and the Interfaces it consumes. The implementer doesn't read the whole plan.

## Hard rules

- Never invent facts: dates, CGPA, rank, authors, venues, publication status, awards. Unknown facts become `TODO(Mamun)` and get a line in `docs/content-todo.md`.
- Content lives only in `src/content/**/*.yaml`. Pages never hard-code content.
- No Tailwind, no UI kits, no icon libraries. Use plain CSS custom properties in `src/styles/global.css`.
- Follow the spec's anti-goals list (no gradients, shadows, card grids, eyebrow labels, animations, emoji).
- Check current Astro and Sveltia APIs with Context7 before writing config code.
- Commit after each task with a conventional message. Work on the `redesign` branch. Never push to `main` without Mamun's approval.

## Commands

- `npm run dev`: dev server (Windows; run in the session Terminal) at http://localhost:4321 (CMS at `/admin`, Chrome or Edge only)
- `npm test`: Vitest (helpers, content lint, CMS config)
- `npm run e2e`: Playwright (builds and previews first)
- `npm run check && npm run build`: type check and static build
