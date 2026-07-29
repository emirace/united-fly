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

Chat attachments are stored in MongoDB and served from `/api/images/:id` rather
than written to disk, which would not survive a serverless deploy.

## Commands

| Command | |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev:db` | Local MongoDB replica set |
| `npm run dev:seed` | Seed demo data via the HTTP API |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
