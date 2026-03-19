# HookCatcher Backend

Express + TypeScript backend for HookCatcher, a RequestBin-style webhook capture and inspection tool.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- MongoDB

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the backend with `nodemon` and `ts-node` |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled server from `dist/index.js` |

## Running the Backend

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000` by default. You can override the port with `PORT`.

The entrypoint loads `dotenv`, so local development can use a `.env` file in the `server/` directory. There is currently no `.env.example` file in this package.

## Data Storage

- PostgreSQL stores bin metadata and other relational records.
- MongoDB stores captured webhook payloads and request documents.

The database connection code lives under `src/db_connections/`.

## Configuration

### Local and Non-Production Behavior

When `NODE_ENV` is anything other than `production`, the backend reads its non-secret configuration directly from environment variables.

Required non-secret variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_SSL`
- `MONGO_DB_NAME`
- `MONGO_RETRY_WRITES`
- `AWS_REGION`
- `AWS_SECRETS_MANAGER_SECRET_ID`

`DB_PORT` must be a positive integer. `DB_SSL` and `MONGO_RETRY_WRITES` must be the string `true` or `false`.

Important current constraint: local development still resolves secrets through `getSecrets()` and the AWS Secrets Manager client. The codebase does not implement a separate local secret source such as plain environment variables for `MONGO_URI`, `DB_USER`, or `DB_PASSWORD`. In practice, local development therefore still needs:

- AWS credentials available to the AWS SDK
- a reachable secret in Secrets Manager
- `AWS_REGION` and `AWS_SECRETS_MANAGER_SECRET_ID` pointing at that secret

### Production Behavior

When `NODE_ENV=production`, the backend fetches non-secret configuration from AWS Systems Manager Parameter Store and then fetches secret values from AWS Secrets Manager.

Parameter Store keys currently hardcoded in `src/config/serverConfig.ts`:

- `/hookcatcher/prod/aws/region`
- `/hookcatcher/prod/aws/sm_secret_id`
- `/hookcatcher/prod/mongo/db_name`
- `/hookcatcher/prod/mongo/retry_writes`
- `/hookcatcher/prod/postgres/db_name`
- `/hookcatcher/prod/postgres/host`
- `/hookcatcher/prod/postgres/port`
- `/hookcatcher/prod/postgres/ssl`

Runtime sequence:

1. The server starts and calls `loadServerConfig()`.
2. In production, the backend reads the Parameter Store values above.
3. The secret id is read from `/hookcatcher/prod/aws/sm_secret_id`.
4. The backend then fetches that secret from Secrets Manager in `AWS_REGION`.
5. The parsed config is cached in-process for the lifetime of the server, and secrets are cached in-process with a default TTL of 5 minutes.

The SSM client bootstraps with `process.env.AWS_REGION` if present, otherwise it defaults to `us-east-1` so it can locate the Parameter Store entries needed for startup.

### Secrets Manager Payload

The backend expects the referenced Secrets Manager secret to contain a JSON object with these fields:

- `MONGO_URI`
- `DB_USER`
- `DB_PASSWORD`

`SECRETS_CACHE_TTL_MS` can be set to override the default 5-minute secret cache TTL.

## Local Database Setup

Background:

- `postgresql` and `mongod` are the database server processes
- `psql` and `mongosh` are the shell clients used to connect to them

### macOS

Install and start PostgreSQL:

```bash
brew install postgresql
brew services start postgresql
```

Install and start MongoDB:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Check both services:

```bash
brew services list
```

### Linux

These commands were written for Ubuntu 22.04 and may vary on other distributions.

Check whether PostgreSQL is already installed:

```bash
psql
```

Or:

```bash
dpkg -l postgresql postgresql-contrib
```

Install and start PostgreSQL:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl status postgresql
```

If PostgreSQL is not running:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Install MongoDB by following the [MongoDB Community Edition instructions](https://www.mongodb.com/docs/manual/administration/install-community/?operating-system=linux&linux-distribution=red-hat&linux-package=default&search-linux=with-search-linux), then start it:

```bash
sudo systemctl start mongod
```

If `mongod` fails with `status=14`, these ownership fixes may help:

```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

Check both services:

```bash
sudo systemctl status postgresql mongod
```

## Preparing Databases for First Run

### PostgreSQL

Create the database:

```bash
sudo -u postgres createdb hookcatcher
```

Verify it exists:

```bash
sudo -u postgres psql -l | grep hookcatcher
```

Apply the schema from the `server/` directory:

```bash
psql -d hookcatcher -f ./src/db_connections/postgres/schema.sql
```

If you are unsure which PostgreSQL user to use locally:

```bash
psql -c "SELECT current_user;"
```

To set a password for that user:

```bash
psql -c "ALTER USER <username> PASSWORD '<new_password>';"
```

### MongoDB

No manual schema setup is required for MongoDB. As long as MongoDB is running and the configured `MONGO_URI` is valid, the application creates the database and collection on first write.

## Backend Structure

```text
src/
├── index.ts
├── app.ts
├── handlers/
├── services/
├── db_connections/
├── config/
├── cleanup/
└── websockets/
```

Request flow follows `handler -> service -> db_connections`: handlers receive HTTP requests, services hold business logic, and database modules talk to PostgreSQL or MongoDB.

![Backend architecture](code-architecture-diagram.png)

## Design Notes

The diagrams below are still useful as high-level references for the backend design and layering:

![Backend implementation decisions](design-decisions.png)
