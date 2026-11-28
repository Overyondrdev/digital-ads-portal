# digital-ads-portal — instructions for Claude

**Start with the [overyondrdev.com Handbook](https://github.com/Overyondrdev/overyondr-website-v1/blob/main/docs/handbook/README.md)**:
the single source of truth for the whole platform (what runs where, sign-in without Cloudflare seats, portals, people
directory, operations, auto-fix, how we work, runbooks, decisions). If your change alters what it says, update it in
the same work (a PR in overyondr-website-v1).

The Yondr ad library at **https://ads.overyondrdev.com**: one Cloudflare Worker (`yondr-ad-portal`) with a D1 database
(`yondr-ad-portal-db`) and a private R2 bucket (`yondr-ad-portal-assets`). Staff browse, download, review and edit
display ads; editors' copy changes re-render the ads in the browser. README.md describes every feature.

## Where things deploy
- Every merge to `main` is built and deployed by **Cloudflare Workers Builds** (about a minute): D1 migrations are applied,
  then the Worker is deployed. No Cloudflare secrets in GitHub; CI (`.github/workflows/ci.yml`) needs none.
- `workers_dev` and `preview_urls` stay `false` in `wrangler.toml`: they would expose the portal without sign-in.
- Sign-in is the shared Yondr Google sign-in (auth.overyondrdev.com), checked by `src/yondr-session.js`.
  That file is a **copy** of `overyondr-website-v1/auth/src/session.js` and must stay identical: never edit it here.

## How to ship a change
1. Branch from `main`. `npm ci` (first time), make the change, `npm run check` (types, script syntax, ad sizes).
2. Push, open a PR with `.github/pull_request_template.md`, wait for **CI**, squash-merge.
3. Check ads.overyondrdev.com once Workers Builds has deployed.
Never force-push `main`. Never commit `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars` or secrets.

## Rules
- The API enforces roles (`src/roles.ts`); the UI only hides. Every write goes through the `editor()` guard.
- Person fields use the shared directory picker (overyondr-website-v1 docs/PLATFORM.md §8): `data-people` on the input.
- D1 schema changes are new files in `migrations/` (never edit an applied one) and must be safe to apply before the new
  code is live, because Workers Builds applies them first.
- A new file in `public/` must be added to `src/static.ts` (app files are bundled into the Worker).
- When a feature changes, update its help article in `public/help-content.js` and the tour step if it moved.
- Every ad file must stay under 150 KB (CI checks `seed/`; the in-browser renderer enforces it on save).
- The ad template is `generator/ad.html`, shared by the offline generator and the portal's re-renderer. After changing
  which text it shows, run `npm run fields` and paste the output into `FIELDS` in `public/editor.js`.
- Ad copy lives in D1 once seeded: run `npm run pull-copy` before an offline re-render, and seed with `--copy` after.
- Never invent statistics, quotes or study findings in ad copy; attribute claims to the Harvard CEPR study.
- Ask before adding a dependency. Keep it accessible and working at 375px wide.

## Commands
- `npm run dev` — local Worker on :8787 (`.dev.vars` with `DEV_EMAIL` signs you in)
- `npm run check` — what CI runs
- `npm run migrate:local` / `npm run seed:local -- --by you@overyondr.com` — local data
- `npm run render` — regenerate the ads (Playwright, Python + Pillow, ffmpeg)
