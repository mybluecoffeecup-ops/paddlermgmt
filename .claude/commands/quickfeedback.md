---
description: Build the app, serve it, and open a Cloudflare quick tunnel so testers can access it via a public URL
---

Goal: get a shareable public URL up as fast as possible for informal tester feedback, reusing whatever mock/live mode `.env.local` is currently set to (don't change it unless asked). This uses Cloudflare's free, account-less "quick tunnel" — no Cloudflare account or domain required, but the URL is random and not guaranteed to stay up long-term. For a stable long-lived URL on a real domain, that's a separate, bigger setup (named tunnel + DNS) — don't attempt that here unless explicitly asked.

## 1. Prerequisites

- Check `cloudflared` is installed (`which cloudflared`). If missing, install it with `brew install cloudflared`.
- Report which mode `.env.local` is currently in (grep for whether `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are commented out or active) so the user knows whether testers will see mock data or hit the real Supabase backend. Don't change it — if the user wants mock data for a quick/no-account share and it's currently live (or vice versa), tell them how to flip it (comment/uncomment those two lines in `.env.local` + restart) rather than doing it for them.

## 2. Clean up any previous quickfeedback run

Avoid stacking duplicate background processes across repeated invocations of this command:
- Kill any existing `cloudflared tunnel --url` process (`pkill -f "cloudflared tunnel --url"`).
- Kill whatever's currently listening on port 3000 (`lsof -i :3000` → `kill <pid>`) — this project always uses 3000 for both `next dev` and `next start`, so it's safe to assume anything bound there is a previous instance of this app.

## 3. Build and serve

- `npm run build` — stop and report if this fails (don't tunnel a broken build).
- Start the production server in the background: `npm run start` (log to a temp file, e.g. `/tmp/quickfeedback-next.log`). Wait a few seconds, then confirm with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` that it's actually serving (expect `200`, or a `307` redirect to `/login` if in live-Supabase mode — both are fine, anything else means it didn't start cleanly).

## 4. Start the tunnel

- `cloudflared tunnel --url http://localhost:3000`, backgrounded, logging to e.g. `/tmp/quickfeedback-tunnel.log`.
- Wait for the log to contain the generated URL (grep for `https://[a-z0-9-]+\.trycloudflare\.com`) — this can take several seconds after the process starts, don't give up after one check.
- Verify the tunnel actually works, not just that a URL was printed: `curl -s -o /dev/null -w "%{http_code}" <the-url>/` and confirm it matches what step 3 got from localhost.

## 5. Report

Give the user the URL clearly (on its own line, easy to copy), plus:
- What mode it's serving (mock data vs. live Supabase, from step 1).
- That the URL is ephemeral — it dies if the tunnel process is killed or the machine sleeps/restarts, and a fresh run of this command will generate a *different* URL.
- That it reflects the build at the time this command ran, not live edits — re-run `/quickfeedback` to pick up new code changes.
- How to stop sharing: kill the two background processes (`pkill -f "cloudflared tunnel --url"` and stop the `npm run start` process), and if they'd been in mock mode purely for this share, remind them how to restore their normal dev workflow (`npm run dev`, or re-enabling Supabase in `.env.local` first if that was flipped off *for this share by the user* — again, this command itself never touches `.env.local`).
