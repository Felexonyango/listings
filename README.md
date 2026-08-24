# Mouv Africa Dashboard

Next.js app for the Mouv Africa APIs.

## What it does

- Authenticates against Firebase with the provided collection credentials.
- Proxies core requests through Next.js API routes so the upstream token stays server-side.
- Shows a dashboard for user details, listing search, and listing inspection.

## Structure

- `src/app` - App Router pages and API routes
- `src/components` - Shared UI and dashboard components
- `src/lib` - API clients, response normalization, formatting, and environment helpers
- `src/types` - Shared TypeScript contracts

## Run locally

1. Install dependencies.
2. Create `.env.local` from `.env.example` if you want to override defaults.
3. Run `npm run dev`.

## Notes
Access listing by 
http://localhost:3000/listings


