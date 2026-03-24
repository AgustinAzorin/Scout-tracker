# Scout Tracker Monorepo

Monorepo with three independent applications:

- `backend/`: Next.js API-only service.
- `frontend-web/`: Next.js web client.
- `frontend-mobile/`: Expo React Native client.
- `packages/`: shared types and utilities.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- `backend/.env.local`
- `frontend-web/.env.local`
- `frontend-mobile/.env`

3. Start apps:

```bash
npm run dev:backend
npm run dev:web
npm run dev:mobile
```