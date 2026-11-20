# Start here (Windows, Claude desktop app)

## 1. Install the tools (one time)
Open **PowerShell** and run each line. Skip any tool that's already installed (check with `git --version` and `node -v`).
```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```
Close PowerShell and open it again, then check: `git --version` and `node -v` (should be 20 or higher).

## 2. Get the repo on your laptop
If it's not already there:
```powershell
cd ~\github_repo
git clone https://github.com/imamunorzrashid/imamunorzrashid.github.io
```
Then copy everything from this kit (`CLAUDE.md`, `START-HERE.md`, `.mcp.json`, `.claude\`, `docs\`) into the `imamunorzrashid.github.io` folder. Show hidden files in File Explorer (View → Show → Hidden items) so you can see `.claude` and `.mcp.json`.

## 3. Open a Claude Code session in the desktop app
1. Click the **Code** tab, then **+ New**.
2. Under the prompt box, set the environment to **Local** and the folder to `imamunorzrashid.github.io`.
3. In the model picker, choose **Opus**.
4. For the permission mode, use **Manual** for the first task so you can see what it does, then **Accept edits**.
5. If it asks to approve the project MCP servers (playwright, context7), approve them.

## 4. Check the setup (first message)
> Which subagents and MCP servers do you have in this project, and which model does each subagent use?

Expected: `implementer` (haiku), `reviewer` (opus), plus the playwright and context7 servers. Then type `/` and look for the **superpowers** skills. If they're missing, click **+** → **Add plugins** → **Browse plugins**, find superpowers, and install it.

## 5. Kick-off prompt
> Read CLAUDE.md, the spec and the plan. Execute the plan with superpowers:subagent-driven-development (if that skill isn't available, follow the same loop yourself: for each task, dispatch the `implementer` subagent, then the `reviewer` subagent, and fix until approved). Don't pass a model parameter when dispatching. Do Task 9 yourself with the humanizer skill. Stop and ask me whenever a fact is missing, and after Tasks 3, 8 and 10.

## Where you come in
- **Web CVs:** export versions of both CVs with "References available on request" and no phone number, and save them as `docs\sources\cv-academic-web.pdf` and `docs\sources\cv-lecturer-web.pdf`. The full versions are never published.
- **After Task 3:** answer what's left in `docs\content-todo.md`.
- **Task 8:** try the forms: in the session's **Terminal** (Ctrl+`), run `npm run dev`, then open `http://localhost:4321/admin/index.html` in **Chrome or Edge** → "Work with Local Repository" → pick the repo folder.
- **Task 10:** preview and approve. **Before** the merge, switch GitHub → Settings → Pages → Source to **GitHub Actions**.

## Updating content later
In a terminal in the repo folder, run `npm run dev`. Open `localhost:4321/admin/index.html` in Chrome or Edge, edit and save, then run:
```powershell
git add -A; git commit -m "content: update"; git push
```
