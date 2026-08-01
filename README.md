# United Fly Airlines

One Next.js app serving both the customer-facing site and the REST API. It
replaces the previous split between `united_airlines` (Vite SPA) and
`flyzone_backend` (Next API), and absorbs the standalone socket.io chat service.

- **UI** — App Router (`src/app`), client-rendered, React context for state.
- **API** — Pages Router (`src/pages/api`), Mongoose models in `src/model`.
- Everything is same-origin, so there is no backend URL to configure.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. Must be a **replica set** — checkout wraps seat/booking/payment creation in a transaction. |
| `JWT_SECRET` | Signs both account and guest-chat tokens. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credentials for image uploads (chat attachments, payment receipts, profile photos). All three are required or uploads fail. |
| `EMAIL_USER` / `EMAIL_PASS` | Fallback mailbox for outbound email (the dashboard Settings screen can override it). |
| `NEXT_PUBLIC_SITE_URL` | Optional. Canonical origin for shareable payment links; derived from the request when unset. |

## Running locally

```bash
npm run dev:db
```

Starts a single-node MongoDB replica set on port 27018 (data lives in the OS
temp directory, deliberately outside the repo so the dev server's file watcher
doesn't restart on every write). Leave it running.

```bash
npm run dev
```

Then, once, to create an admin, a customer, four airports and five flights:

```bash
npm run dev:seed
```

It prints the two logins — the admin one unlocks the Airports, Flights, All
bookings, All payments, Support inbox and Settings screens.

## Support chat

Chat used to be a separate socket.io service. It now lives in this app under
`/api/messages/*` and `/api/images`, and the client polls instead of holding a
socket open: the open thread every 5s, the conversation list every 10s, and only
while a chat surface is mounted. Typing indicators have no polling equivalent
and were dropped.

Anonymous visitors get a **guest** token stored under `chatToken`, never
`authToken`. Guests live in their own `GuestUser` collection, so entering a real
customer's email in the widget gives you a support thread of your own and
nothing else.

Chat attachments — along with payment receipts and profile photos — are uploaded
to Cloudinary rather than written to disk, which would not survive a serverless
deploy. `POST /api/images` takes the multipart file, checks the token, size (5MB)
and type, hands the bytes to Cloudinary under the `united-fly` folder, and returns
`{ imageUrl }` with the CDN url that gets persisted on the message or payment.
Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in
`.env.local` or uploads fail.

## Outbound email

When an admin approves or rejects a payment, the traveller is emailed a branded
confirmation (booking reference, route, flight, seats, travellers, amount) with
a link to download their e-ticket, or a cancellation notice with the reason.
Bodies live in [`src/utils/emailTemplates.ts`](src/utils/emailTemplates.ts) and
are sent as HTML with a plain-text alternative.

`sendEmail` resolves the mailbox in this order:

1. credentials passed by the caller (the admin compose screen),
2. `mail.name` / `mail.password` on the **Settings** document,
3. `EMAIL_USER` / `EMAIL_PASS` from the environment.

Step 2 used to be missing everywhere except `/api/emails`, so payment
confirmations, password resets and verification mail all fell through to the
environment and failed authentication whenever it was unset — silently, because
each caller only logged the error.

Gmail needs an **App Password**, not the account password; a plain password has
been rejected since 2022. Whitespace is stripped before use, since Google shows
app passwords in four space-separated groups and they get pasted that way.

Mail failure never fails the request that triggered it — the payment status is
already committed by then — but `PUT /api/payments/:id` now returns `emailed:
false` so a caller can tell the difference.

## PDF tickets

Customers can download an A4 e-ticket from the bookings list, the booking
detail modal and the confirmation screen. It carries the route, flight, cabin,
passengers and seats, the fare paid, a QR code of the booking reference, and
baggage/check-in notes. Passport details are deliberately left off — the file
gets emailed and left in downloads folders.

It is generated **in the browser**: `src/components/ticket/ticketDocument.tsx`
is mounted off-screen, rasterised by html2canvas-pro, and wrapped in a PDF by
jsPDF (`src/utils/pdf.ts`). Both libraries are imported inside the click
handler, so neither is in any page's first-load bundle.

Rendering it client-side rather than on the server is what makes **Arabic**
work: the browser shapes and joins the script, and the capture photographs the
result. Server-side PDF libraries have no bidi engine and would emit isolated
letterforms in the wrong order.

Editing the ticket has rules the rest of the app doesn't:

- **No Tailwind classes inside it.** Tailwind v4 compiles `bg-white/10` to
  `color-mix(in oklab, …)`; use inline literal hex. It is also the only light
  surface in a dark-only app.
- **No `h1`–`h3`** (base styles would override its typography) and **no
  react-icons** (inline `<svg>` is the flakiest thing html2canvas handles).
- **No `letter-spacing` on translated text.** It breaks Arabic contextual
  joining, and html2canvas then draws each character separately — dropping the
  definite article's alef. `micro()` in that file swaps to plain sans for RTL.
- **No `moment`.** `MomentLocale` sets moment's locale globally, so
  `format()` returns Arabic-Indic digits. `src/lib/ticket.ts` formats through
  `Intl` with `-u-nu-latn` so references, times and fares stay machine-readable.
- The route strip is forced `dir="ltr"` in every language — an itinerary reads
  origin → destination universally.

The fare lives on the payment, not the booking, so each surface supplies it
from whatever it already loaded; a booking with no matching payment simply
renders without the fare block.

## Languages

The site ships in English, French, German, Japanese and Arabic. The visitor's choice lives in a
`LOCALE` cookie — URLs are unchanged — so the server renders the right language
on the first paint with no flash of English. A first-time visitor is matched
against `Accept-Language` before falling back to English.

`messages/en.json` is the source of truth and is written by hand. Every other
locale file is generated:

```bash
npm run i18n:translate -- fr ar
```

The script is incremental. `messages/.hashes.json` records the hash of the
English string each translation came from, so a re-run only touches keys whose
English changed — including wording you corrected by hand, which is copied
through untouched. It needs an Anthropic credential (`ANTHROPIC_API_KEY` or an
`ant auth login` profile); an already-up-to-date run makes no API calls and
needs none.

```bash
npm run i18n:check          # validate every locale against en.json
npm run i18n:check -- --write-hashes   # after hand-editing a locale file
```

`i18n:check` parses each message with the same ICU parser next-intl uses at
runtime, which catches a class of bug a diff never will — most notably that an
apostrophe is ICU's escape character, so a French plural reading `qu'#` silently
swallows the rest of the message. It also verifies that placeholders match and
that no keys are missing or stale.

**Adding a language** is three steps: add the code and display name to
[`src/i18n/config.ts`](src/i18n/config.ts), run `npm run i18n:translate -- <code>`,
and commit the generated file. To localise the date picker too, add a matching
entry to `loaders` in [`src/lib/datepickerLocale.ts`](src/lib/datepickerLocale.ts) —
those imports are written out statically so the bundler can resolve them.

Right-to-left languages work without per-screen effort: `dir` is set from
`rtlLocales`, and the customer-facing components use logical Tailwind utilities
(`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`) rather than physical ones.

The design opens most sections with a small mono, uppercase, letter-spaced
label. All three of those are Latin devices, so locales listed in
`nonLatinLocales` drop them and get a slightly larger sans label instead —
letter-spacing breaks Arabic's contextual joining outright, and merely looks
wrong spread across Japanese glyphs. `useLatinEyebrow()` in
[`src/lib/eyebrow.ts`](src/lib/eyebrow.ts) is the hook; a new locale written in
Latin script needs no entry.

Not translated, by design: API error messages, database content (airport and
city names, the payment details from Settings), the admin dashboard, and prices
— the switcher changes language only, not currency.

## Commands

| Command | |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev:db` | Local MongoDB replica set |
| `npm run dev:seed` | Seed demo data via the HTTP API |
| `npm run i18n:translate` | Generate locale files from `en.json` |
| `npm run i18n:check` | Validate locale files (ICU, placeholders, coverage) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
