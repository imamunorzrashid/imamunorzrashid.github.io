# mamunorrashid.me

## How to edit

The content lives in `src/content/` as YAML. You edit it through the Sveltia CMS at `/admin/`, which runs only in development. The production site never includes it.

1. Run `npm run dev` in the project folder.
2. Open `http://localhost:4321/admin/` in Chrome or Edge. Firefox can't use the local repository workflow. Click "Work with Local Repository" and choose this project folder (first time only).
3. Edit and save. The CMS writes the YAML into the content folders, and the dev server shows the change live. Uploaded photos are converted to WebP and resized to at most 1600 px wide.
4. Commit and push the change:

   ```sh
   git add -A && git commit -m "content: <what changed>" && git push
   ```

   GitHub Actions rebuilds and deploys the site in about a minute.
