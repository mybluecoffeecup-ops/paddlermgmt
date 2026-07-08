---
description: Push the Paddler Management App to github.com/mybluecoffeecup-ops/paddlermgmt, keep its GitHub Pages deploy/README/About section current, and scan for secrets first
---

Target repo for this command: **`mybluecoffeecup-ops/paddlermgmt`** (remote `origin`). This repo also serves a live GitHub Pages site at `https://mybluecoffeecup-ops.github.io/paddlermgmt/`, built from `prototype.html` (the standalone lineup-builder mockup) — the Next.js app itself is not statically exported and is not what Pages serves.

Run the following steps in order. Stop and report back if any step fails or finds a problem — do not proceed past a failed security scan, and do not proceed if `git remote -v` shows `origin` pointing anywhere other than `mybluecoffeecup-ops/paddlermgmt` (ask the user first — see the incident from 2026-07-08 where a differently-named target repo turned out to already hold an unrelated project).

## 1. Security scan (always first, before anything is staged or pushed)

- Run `git status` and `git diff` (staged + unstaged) to see exactly what would be committed.
- Scan changed/new files for secrets: API keys, tokens, passwords, private keys, `.env` files, credentials JSON, connection strings, etc. Look both at filenames (e.g. `.env`, `*.pem`, `credentials.json`) and file contents (e.g. `AKIA...`, `sk-...`, `-----BEGIN PRIVATE KEY-----`, Supabase service-role keys).
- Double-check `.env.local` (if present) is not staged — only `.env.local.example` with placeholder values should ever be committed.
- If anything sensitive is found: do NOT stage or push it. Tell the user exactly what was found and where, and ask how to proceed (e.g. add to `.gitignore`, remove, rotate the credential) before continuing.
- If clean, proceed.

## 2. Push/update code to GitHub

- Check current branch and remote (`git remote -v`) and confirm it matches `mybluecoffeecup-ops/paddlermgmt` per the guard above.
- Stage relevant changes (avoid `git add -A`; add specific files — this repo's `.gitignore` already excludes `node_modules`, `.next`, `.env*`, `*.tsbuildinfo`), commit with a concise message describing what changed and why, and push to `main`.

## 3. Create/update the GitHub Pages deployment via GitHub Actions

- Check for `.github/workflows/deploy-pages.yml`. If missing, recreate it: `actions/checkout` → copy `prototype.html` to `dist/index.html` → `actions/configure-pages` → `actions/upload-pages-artifact` (path `dist`) → `actions/deploy-pages`, triggered on push to `main`.
- If `prototype.html` has changed in ways that need a different static bundle (e.g. more files to include), update the workflow's "Assemble static site" step accordingly rather than inventing a new structure.
- Ensure GitHub Pages is configured with the Actions build source (`gh api repos/mybluecoffeecup-ops/paddlermgmt/pages` — POST if not yet configured, PUT to update `build_type: workflow` if it already exists with a different source).
- After pushing, confirm the workflow run succeeds (`gh run list --repo mybluecoffeecup-ops/paddlermgmt`, `gh run watch <run-id> --repo mybluecoffeecup-ops/paddlermgmt --exit-status`), then verify the live URL responds (`curl -s -o /dev/null -w "%{http_code}" https://mybluecoffeecup-ops.github.io/paddlermgmt/`).

## 4. Create/update a professional README

- Refresh `README.md` covering: project name/description, the live Pages link (`https://mybluecoffeecup-ops.github.io/paddlermgmt/`), key features, how to run/preview locally, project structure, and how deployment works (pointing at `.github/workflows/deploy-pages.yml`).
- Base the content on what's actually in the repo right now — don't invent features or tech that aren't present. Re-read `CLAUDE.md` and the `src/` tree if it's been a while since the structure was last documented here.

## 5. Update the GitHub repo "About" section

- `gh repo edit mybluecoffeecup-ops/paddlermgmt --description "<one-line description>" --homepage "https://mybluecoffeecup-ops.github.io/paddlermgmt/"`.
- Verify with `gh repo view mybluecoffeecup-ops/paddlermgmt --json description,homepageUrl`.

## Final report

Summarize what changed: commit(s) pushed, whether the Pages workflow was created or already existed, whether the deploy run succeeded and its live URL, README changes, and the updated About section. Flag anything skipped and what the user needs to do to unblock it.
