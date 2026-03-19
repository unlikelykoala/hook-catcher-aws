# HookCatcher

HookCatcher is a RequestBin-style webhook capture and inspection tool. It lets you create temporary bins, send webhooks to bin-specific URLs, and inspect captured requests in a browser with live updates.

## Architecture

- `client/`: React 19 + TypeScript + Vite frontend
- `server/`: Express + TypeScript backend
- PostgreSQL stores bin metadata
- MongoDB stores captured request payloads
- WebSockets push new requests to the active bin view

## Current Capabilities

- Create bins from the UI
- List existing bins
- Copy a bin's webhook URL
- Inspect captured request headers and bodies
- Delete bins
- Receive live updates when new requests arrive

## Repository Structure

- [`client/`](./client/) contains the frontend application and client-specific setup details
- [`server/`](./server/) contains the backend application, database setup, and runtime configuration details

## Development Workflow

Install dependencies and run each package separately:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

The backend listens on port `3000` by default. See the package READMEs for package-specific setup and configuration:

- [`client/README.md`](./client/README.md)
- [`server/README.md`](./server/README.md)

## Backend Configuration Summary

The backend uses two different AWS services in production:

- AWS Systems Manager Parameter Store stores non-secret runtime configuration such as database host, database name, and feature flags like SSL and retry behavior.
- AWS Secrets Manager stores secret values such as the MongoDB connection URI and PostgreSQL credentials.

In local and other non-production environments, the backend reads its non-secret configuration from environment variables. Secrets are still resolved through the backend's Secrets Manager integration, so the detailed setup and current constraints are documented in [`server/README.md`](./server/README.md).
