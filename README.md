# Чамд бичсэн бяцхан захиа 💌

An existing React + Vite + TypeScript romantic scrapbook, now with Mongolian copy, self-hosted Noto fonts that include **Ү ү Ө ө**, four photo-inspired palettes, and a server-side Resend notification flow. Original source folders, photos, and notes remain untouched.

The final reply now offers an optional **calendar day**, a Saturday shortcut, and a flexible “decide together later” option. The day is a preference, not a booking or a claim that an event is available. It is included in both email formats and saved in the confirmation receipt. Dates are checked against today's date in Ulaanbaatar; pending retries keep their original day even across midnight. Choosing “maybe” or “no” clears the day. A small **surprise me** button opens a randomly chosen unexplored folder without selecting a plan or sending anything.

## Free email setup

[Resend's Free plan](https://resend.com/pricing) currently includes **3,000 transactional emails per month, up to 100 per day** (checked October 18, 2026). This project uses the transactional send endpoint, with no paid add-ons, database, or subscription required for that allowance. Stay on the Free plan; this code does not configure paid upgrades.

Your requested recipient is set in this computer's ignored `.env.local`. To receive notifications, you still need to supply `RESEND_API_KEY` and `FROM_EMAIL`, and set all four server variables in Vercel. The local recipient setting is deliberately not pushed to GitHub or embedded in the frontend. An email address alone cannot enable delivery.

For a **no-domain test**, Resend allows `onboarding@resend.dev` to send only to the email address associated with your Resend account. Register with your notification Gmail address if you want to test that route. This sender is for testing; normal production sending uses a verified domain you own. Your Gmail can be the recipient, but cannot serve as a verified sending domain. Domain registration may cost money if you do not already own one. See [test-sender restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) and [verified domains](https://resend.com/docs/dashboard/domains/introduction). No account, domain purchase, or paid service has been created for you.

## Start locally

Use Node.js 24 and run these commands inside `date-website`:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:5173. The Vite development middleware runs the **same** `api/submit-response.ts` Node handler locally. No Vercel account is needed for local development. Without email configuration, exploration works and submitting returns a controlled `503 CONFIGURATION_REQUIRED` with a friendly retry message. It never pretends an email was sent.

`npm.cmd` avoids the PowerShell script execution-policy issue on this computer; `npm` also works in other shells. `npm run preview` serves the built frontend only, without the API; use `npm run dev` or `vercel dev` when testing submission.

## Setup and deployment: eleven steps

1. **Install dependencies.** Run the commands above. `package-lock.json` is included. No database is needed.
2. **Create a Resend account — your account required.** Go to [Resend](https://resend.com/docs).
3. **Verify a sending domain — your domain/DNS access required.** Add a domain in Resend and install the DNS records it provides. Wait for verification, then use a sender address on that verified domain. See [verified domains](https://resend.com/docs/dashboard/domains/introduction). A limited Resend test sender is only suitable when its recipient restrictions fit your account; use your verified domain for the invitation.
4. **Create an API key — your credentials required.** Create a Resend sending API key. Keep it server-side and private.
5. **Configure local environment variables.** Copy `.env.example` to `.env.local` if you have not created that file yet, then fill the four values below. For local development, set `SITE_URL` to **http://127.0.0.1:5173**, matching the browser address exactly. Restart the dev server after environment changes.
6. **Test locally.** Run the checks below. With real credentials configured, explicitly submit one test answer in the UI and verify its email in your inbox and Resend dashboard. Automated tests use a stubbed provider; they do not deliver email.
7. **Push to a Git repository — your Git provider account required.** Use `date-website` as the repository root, or include it as a subdirectory. Include `api/`, `server/`, `shared/`, `src/`, `public/`, scripts, configuration, and the lockfile. The copied photos and generated source manifest make the repository independent of the four sibling source folders. `.env*` secrets, `.vercel/`, dependencies, and local QA files are ignored.
8. **Import the repository into Vercel — your Vercel account required.** Choose **Vite**. Set Root Directory to `date-website` if the repository contains the whole workspace, or leave it at the repository root if that root is the app. Build command: **npm run build**. Output directory: **dist**. Install command: **npm ci** (or Vercel's detected npm default). Node.js: **24.x**. The checked-in `vercel.json` declares the framework/build/output and Function timeout. Deploy to obtain your actual HTTPS URL.
9. **Set the four environment variables in Vercel Project Settings → Environment Variables.** Use your real values. Set `SITE_URL` to the exact production origin returned by Vercel, with no path/query/hash. All four variables are server-only: do **not** add a `VITE_` or `NEXT_PUBLIC_` prefix. For previews, configure `SITE_URL` for the preview origin if you intend to submit there; the server rejects an Origin that differs from this value. Use the canonical URL when sharing the invitation.
10. **Redeploy after adding or changing production variables.** The first deployment can show the website before email is configured; redeployment activates the completed setup. Ensure the production deployment is publicly accessible in Vercel's deployment-protection settings, then use its HTTPS URL to share the invitation. No custom website domain or website DNS changes are required for the supplied Vercel URL.
11. **Test the deployed invitation.** Open it on a phone, explore all four folders, choose a date, and explicitly submit one answer. Verify the notification arrives and contains the correct answer/date/message. Refresh confirmation and check that it sends no new email. Check `GET /api/submit-response` returns JSON **405** with `Allow: POST`, rather than the app's HTML, to verify Function routing. A success screen means Resend accepted the notification request, not proof of inbox delivery; use the provider dashboard/inbox for that final check.

| Variable | Server-side purpose |
| --- | --- |
| `RESEND_API_KEY` | Your Resend sending key; also signs short-lived submission tickets using HMAC. |
| `NOTIFICATION_EMAIL` | Your single notification recipient. The browser cannot set it. |
| `FROM_EMAIL` | A plain sender email address authorized by your Resend account/domain. |
| `SITE_URL` | The exact canonical origin, HTTPS in production; local HTTP is allowed only for localhost development. |

The example file has empty values. No API key, email account, verified domain, or deployment URL has been invented or provisioned.

### Optional Vercel CLI workflow

The CLI is optional; the dashboard steps above are sufficient. From the app directory:

```powershell
npx.cmd vercel login
npx.cmd vercel link
npx.cmd vercel dev --listen 5173
```

The first two commands require your Vercel account and project selection. Use the same local `SITE_URL` origin/port as the browser. Stop `npm run dev` first so port 5173 is available. Vercel Dev runs the Function through Vercel's local runtime; the regular Vite dev command uses the local adapter with the same validation/email implementation.

For a production deployment after configuring the project and its environment variables:

```powershell
npx.cmd vercel --prod
```

Vercel prints the actual URL after deployment; it cannot be known until your account/project is connected. See [Vercel CLI deployment](https://vercel.com/docs/cli/deploy) and [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## The actual submission flow

Opening the letter, browsing folders, picking a calendar day, or selecting a date sends **no email**. A date-selection button takes the visitor to the final question. That form supports `yes`, `maybe`, and `no`, plus an optional message of at most 1,000 JavaScript characters. A `yes` can include an optional `preferredDay` in real `YYYY-MM-DD` format; omitted/null means flexible. Past days are rejected during preparation with HTTP 422, using the Ulaanbaatar calendar. A day attached to `maybe` or `no` is rejected. Each response has an accurate, respectful confirmation.

Only an explicit click on **Хариугаа илгээх** starts these two POST requests to the same endpoint:

```json
{
  "intent": "prepare",
  "response": "yes",
  "selectedDateId": "chess",
  "preferredDay": null,
  "message": "Хамтдаа явъя ♡",
  "website": ""
}
```

The server validates this answer, assigns a UUID and server timestamp, and returns a signed `submissionToken`. This request sends no email. The browser saves the ticket before making the final request:

```json
{
  "intent": "submit",
  "response": "yes",
  "selectedDateId": "chess",
  "message": "Хамтдаа явъя ♡",
  "website": "",
  "submissionToken": "<the exact token returned by prepare>"
}
```

Use `null` or omit `selectedDateId` for no date choice. Actual IDs are `chess`, `theatre`, `exhibition`, and `basketball`. A browser-supplied `selectedDateTitle` is permitted only as a short string for compatibility and is ignored; the server always resolves the authoritative title from `shared/date-catalog.ts`. Unexpected properties, invalid IDs/answers, malformed JSON, excessive messages, or a filled honeypot are rejected.

The second request verifies the ticket and sends HTML plus plain-text email through [Resend's send-email API](https://resend.com/docs/api-reference/emails/send-email). The email contains the actual answer, authoritative selected title or explicit no-selection text, safely escaped optional message, the server's receipt timestamp (including Ulaanbaatar time), canonical website URL, and submission ID. It contains no IP address or unnecessary personal data. There is no logging of the message or provider error response.

Only a successful provider response with an email ID yields `200 { ok: true, stage: "submitted", submissionId }` and a confirmation. Provider acceptance is not an inbox-delivery guarantee. Network/provider failures keep the visitor on a friendly retry screen.

## Retry, refresh, and abuse safeguards

- A synchronous frontend lock prevents rapid clicks. API calls occur in explicit submit handlers, never React effects or page-load logic.
- Pending answers/tickets and successful receipts live in browser **session storage**. Reloading a pending form does not send anything until the visitor clicks retry. Reloading confirmation never resubmits. Storage-disabled browsers can retry in the current page, but cannot retain the state across refreshes.
- Prepared answers are locked while delivery is unconfirmed, preserving the payload during retries. Their chosen date stays attached even if the visitor browses another folder. A retry uses the original signed ticket, server timestamp, email body, and `Idempotency-Key: little-letter/<server-UUID>`.
- [Resend retains idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). Tickets expire after **23 hours**, so an old request cannot be retried after the provider's deduplication window. Expired pending submissions ask the visitor to contact you directly; the app does not silently mint a new ticket. Changing the API key invalidates pending tickets; changing sender/recipient/site configuration while an answer is pending may cause a provider conflict.
- The application does **not** claim exactly-once delivery. A deliberate new submission, a new browser session, cleared storage, or restarting a completed experience can create a new notification. There's no durable application database recording every visitor's answer.
- Each warm server instance enforces **12 API requests per client per 10 minutes** and **60 API requests total per hour**; a normal answer uses two. It stores only short-lived hashed client identifiers. These are best-effort limits and do not aggregate across Vercel instances or cold starts. Same-origin checks, JSON-only requests, a honeypot, signed answer-bound tickets, and an **8 KiB** request cap provide additional basic safeguards. Scripted attackers can still request new tickets.
- For wider public sharing or observed abuse, add a **Vercel Firewall** rate-limit rule on `/api/submit-response` (subject to your plan), or a shared Redis limiter/CAPTCHA. Those provide stronger distributed protection but require extra configuration/services; none is required for this personal invitation. No extra database was introduced.
- The server uses one provider request per attempt, a 12-second timeout, and no automatic email retries. Provider internals, stack traces, and credentials are never sent to the browser. Responses are non-cacheable. Status codes include 400, 403, 405, 410, 413, 415, 422, 429, 502, and 503 as appropriate.

## Routing, content, and design

Navigation retains the existing hash URLs: `/#options`, `/#chess`, `/#theatre`, `/#exhibition`, `/#basketball`, `/#question`, and `/#confirmation`. Hashes are not sent to the server, so no catch-all SPA rewrite is necessary. The first visit opens the letter and then continues to a requested date. This avoids a rewrite accidentally swallowing `/api/submit-response`; Vercel serves that path from the root `api` directory.

| Original folder | Theme | Original timing | Photos |
| --- | --- | --- | --- |
| `e4 chess bar` | Warm terracotta chess journal | Anytime | 3 |
| `Амьтны ферм жүжиг` | Slate stage blue and red costume details | Since October 30th | 8 |
| `Социализмаар аялцгаая` | Aged parchment, ochre rugs, rust furniture | Until November 19th | 7 |
| `Үндэсний дээд лиг` | Indigo and navy from the schedule | Anytime | 1 |

`scripts/sync-content.mjs` reads each original note and discovers images, copying them to `public/dates/<id>/` with original filenames. It preserves the full source notes in `src/data/source-manifest.json`. It runs before dev/build. When the sibling folders aren't present in a repository checkout, it validates and uses the checked-in manifest/assets. All 19 images ship in `dist/dates/`. The source timing has no year; no year, price, exact event session, venue address, or itinerary is invented.

The updated main palette is warm ivory and mulberry. `src/styles/mongolian.css` adapts the existing scrapbook typography and compositions; `src/styles/fonts.css` includes explicit Latin, Cyrillic, and extended-Cyrillic Unicode ranges. Self-hosted Noto Serif/Sans glyphs render Ү/Ө in headings, body text, and italic notes. `scripts/generate-fonts.mjs` regenerates this stylesheet after font dependency changes.

Each full-page background is a lighter paper tint of colors sampled from that folder's actual photographs. Palette values live in `src/data/dates.ts` and also style folders and confirmation recaps. Basketball now follows the schedule's indigo rather than teal. Photographs retain accessible alt text without visible picture descriptions.

Main implementation files: `src/components/`, `src/hooks/useInvitation.ts`, `src/hooks/useSubmission.ts`, `src/data/dates.ts`, `shared/date-catalog.ts`, `api/submit-response.ts`, `server/submissions.ts`, `server/guards.ts`, `server/email.ts`, `server/local-api.ts`, `vite.config.ts`, and `vercel.json`.

## Mobile previews and GitHub credentials

Run `npm.cmd run preview:mobile` to capture the current site at a 390 × 844 phone viewport using installed Google Chrome. The helper starts a local dev server only if needed and stops the server it starts. Open `qa/mobile-preview.html` to compare the letter, menu, and all four date backgrounds, or `qa/mobile-preview.png` for the overview image. Click a phone in the HTML preview to see its full-page screenshot. `qa/mobile-question-full.png` shows the final invitation. The helper never submits a response or sends an email. These are browser emulations, not photographs of a physical phone.

Each date has its own full-page background in `src/data/dates.ts` → `palette.background`, including the header/footer and mobile browser theme color. Main text and controls remain Mongolian, with short English annotations. Gallery pictures and the lightbox have no visible descriptive captions; accessible alt text remains.

The workspace folder `../.local-credentials/` contains an empty `github.env` with `GH_TOKEN=` and optional `GH_REPO=` (`owner/repository`). You can fill this file locally with a GitHub personal access token, not your account password. It is outside the app, ignored by the workspace `.gitignore`, and not loaded by the website or deployment. Creating/filling it does not sign in or push anything. This is plain-text storage in your OneDrive workspace; the folder's README describes the trade-off. [GitHub CLI browser login](https://cli.github.com/manual/gh_auth_login) is an alternative that normally uses your operating system's credential store.

## Checks and verification limits

```powershell
npm.cmd run build
npm.cmd run check:content
npm.cmd run check:fonts
npm.cmd run check:secrets
npm.cmd run test:api
npm.cmd test
```

The API tests run a real local HTTP server with a **stubbed Resend provider**, covering permitted/rejected answers, authoritative date ideas, calendar-day validation, email day formatting, message escaping/limits, malformed/oversized bodies, methods, origin checks, honeypots, missing configuration, rate limits, signed-ticket tampering/expiry, stable cross-instance and midnight retries, and private provider failures. They never contact Resend.

Browser tests use installed Google Chrome and exercise the four galleries, keyboard lightbox controls, explicit submission, choosing/clearing a day, surprise discovery, failure/retry, pending-state refresh, receipt refresh, response accuracy, hash deep links, extended-Cyrillic fonts, mobile restart, and overflow at 360, 390, 768, and 1440 pixels. Successful email responses are mocked; a separate browser test exercises the real local endpoint with missing configuration.

**Requires your later setup:** authenticated Vercel build/deployment, the final public HTTPS URL, live Function routing, verified sending domain, real Resend acceptance, and actual inbox delivery. No real email was sent and no Vercel production deployment was performed during implementation. Complete step 11 before sharing the URL.
