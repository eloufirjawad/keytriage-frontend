# KeyTriage Frontend Baseline (Vuexy Starter)

This folder is the **lean working frontend** extracted from:

- `vuexy-10111/nextjs-version/typescript-version/starter-kit`

Goal:
- Keep only what we need for KeyTriage app work.
- Avoid using the full Vuexy bundle and unrelated framework variants.

## What was selected

- Next.js TypeScript starter kit only.
- App Router structure (`src/app`) ready for building:
  - Debug packet flow UI
  - Minimal dashboard UI
  - Zendesk-facing internal views as needed

## What was not selected

- Vuexy full-version package
- JavaScript variant
- Django variant
- Design/source bundles
- Other template ecosystems

## Implemented in this baseline

1. Landing page:
   - Route: `/`
   - Product overview + CTA links to workspace routes.
2. Public debug packet page:
   - Route: `/debug/[packetId]?token=...`
   - Uses local proxy routes:
     - `GET /api/public/packets/[packetId]`
     - `POST /api/public/packets/[packetId]/submit`
3. Internal dashboard:
   - Route: `/app/dashboard` (legacy `/dashboard` redirects)
   - Uses Django analytics + zendesk connection endpoints server-side.
4. Ticket workbench:
   - Route: `/app/tickets`
   - Send/resend debug link, refresh latest packet, insert macro, escalate ticket.
5. Settings page:
   - Route: `/app/settings` (legacy `/setup` and `/about` redirect)
   - Tenant settings + Zendesk connection + OAuth start.
6. App proxy routes (server-side tenant auth):
   - `/api/app/tenant`
   - `/api/app/zendesk/connection`
   - `/api/app/zendesk/oauth/start`
   - `/api/app/tickets/[ticketId]/*`
   - `/api/app/packets/[packetId]/macros`
7. Screenshot proxy:
   - Route: `/api/packets/[packetId]/screenshot`
   - Server-side calls backend screenshot endpoint with tenant API key.

## Required env vars

- `NEXT_PUBLIC_API_BASE_URL` (example `http://127.0.0.1:8000`)
- `NEXT_PUBLIC_APP_URL` (example `http://localhost:3000`)

Auth note:
- Tenant API key is now entered by the user in `/login` and stored in an HttpOnly cookie.
- New tenant registration is available at `/register`.

## Run

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
