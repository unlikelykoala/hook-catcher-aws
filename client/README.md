# HookCatcher Frontend

This package contains the HookCatcher frontend. It provides the browser UI for creating bins, browsing existing bins, copying webhook URLs, inspecting captured requests, and receiving live updates as new requests arrive.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zod for runtime validation

## Available Scripts

```bash
npm install
npm run dev
```

Additional scripts:

- `npm run build` builds the production bundle
- `npm run preview` serves the built app locally
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files

## Environment Variables

Environment variables are loaded through Vite and only variables prefixed with `VITE_APP_` are read by the app.

Supported variables:

- `VITE_APP_API_URL`: Base URL used for backend HTTP requests. If omitted, the app falls back to the current origin.
- `VITE_APP_APP_URL`: Canonical frontend app URL. If omitted, the app falls back to the browser origin.

Example:

```bash
VITE_APP_API_URL=http://localhost:3000
VITE_APP_APP_URL=http://localhost:5173
```

## Backend Integration

The frontend currently integrates with the backend in two ways:

- HTTP requests to `/api/bins` for bin creation, listing, lookup, and deletion
- WebSocket connections to `/ws` for live updates while viewing a bin

If `VITE_APP_API_URL` points at a different backend origin, the frontend derives the WebSocket host from that same backend URL.

## Project Structure

- `src/app`: app shell, router, and top-level providers
- `src/features/bins`: pages, API calls, schemas, hooks, and bin-specific UI
- `src/components`: shared UI and layout components
- `src/config`: frontend environment parsing and URL helpers
