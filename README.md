# Ticket System

A small fullstack ticket system built as a monorepo, with the focus on **CORS**.

Tickets are created with a randomly generated code. A ticket can be used 
once after that the code is rejected. Tickets that have not been used can be
deleted; used tickets cannot. The frontend lists every ticket and whether it has
been used.

The frontend runs on `http://localhost:5173` and the API on
`http://localhost:3000`. Different ports mean **different origins**, so every
request from the browser is cross-origin and must be explicitly allowed by the
API. That is handled by a CORS middleware rather than a library, so
each header can be accounted for.

## Tech stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 19 + Vite (TypeScript)     |
| Backend  | Node.js + Express 5 (TypeScript) |
| Database | SQLite via `better-sqlite3`      |
| Tooling  | npm workspaces, `tsc --noEmit`   |

TypeScript runs directly on Node — there is no build step for the backend. Node
strips the type annotations at startup.

## Database design

One table. SQLite has no dedicated date type, so timestamps are stored as `TEXT`
in the format produced by `datetime('now')` — `YYYY-MM-DD HH:MM:SS`, in UTC.

```
+---------------------------------------------------------------------+
| tickets                                                             |
+--------------+---------+--------------------------------------------+
| id           | INTEGER | PRIMARY KEY (auto-assigned by SQLite)      |
| ticket_code  | TEXT    | NOT NULL, UNIQUE - the code the user gets  |
| created_at   | TEXT    | NOT NULL, DEFAULT (datetime('now'))        |
| redeemed_at  | TEXT    | NULL when unused, timestamp when used      |
+--------------+---------+--------------------------------------------+
```

```sql
CREATE TABLE IF NOT EXISTS tickets (
    id          INTEGER PRIMARY KEY,
    ticket_code TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    redeemed_at TEXT NULL
);
```
## Getting started

### Prerequisites

- **Node.js 24** (tested on 24.19). Required because the backend runs TypeScript
  directly, without a build step.
- npm 10 or later (ships with Node)

### 1. Install

Run from the repository root. npm workspaces installs both packages at once.

```bash
npm install
```

### 2. Create the environment files

Neither `.env` is committed. Copy the templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`

```
PORT=3000
DB_NAME=tickets.db
CORS_ORIGIN=http://localhost:5173
```

`frontend/.env`

```
VITE_API_URL=http://localhost:3000
```

The database file is created automatically on first run — there is no migration
step.

### 3. Run both servers

Two terminals, both from the repository root:

```bash
npm run dev:api    # http://localhost:3000
```

```bash
npm run dev:web    # http://localhost:5173
```

Then open <http://localhost:5173>.

### Other commands

```bash
npm run typecheck          # type-check both workspaces
npm run build -w frontend  # production build of the frontend
```

## CORS

The browser blocks a cross-origin response unless the server opts in. Without the
middleware the request still reaches the API and still returns `200` — the
browser then discards the response and `fetch` rejects with `Failed to fetch`.
The server never learns anything went wrong, and `curl` is unaffected, because
**CORS is enforced by the browser, not by the server**.

`backend/src/middleware/corsMiddleware.ts` sets four response headers:

| Header                         | Value                        | Purpose                                    |
| ------------------------------ | ---------------------------- | ------------------------------------------ |
| `Access-Control-Allow-Origin`  | `CORS_ORIGIN` from `.env`    | which origin may read the response         |
| `Access-Control-Allow-Methods` | `GET, POST, DELETE, OPTIONS` | which verbs are permitted                  |
| `Access-Control-Allow-Headers` | `Content-Type`               | which request headers are permitted        |
| `Vary`                         | `Origin`                     | stops caches reusing one origin's response |

It also answers the **preflight**. `GET` and simple `POST` requests go straight to
the server, but `DELETE` makes the browser send an `OPTIONS` request first to ask
permission. The middleware replies `204` and returns without calling `next()`, so
preflights never reach the routes. Deleting a ticket therefore produces two
network requests: `OPTIONS`, then `DELETE`.

The allowed origin is a specific URL rather than `*`. `*` would also work here,
but it permits any website to call the API from a browser, which is not a
sensible default for an API that mutates data.

**The two ports must agree.** `CORS_ORIGIN` in `backend/.env` must match the
address Vite actually serves on. Vite defaults to `5173` but silently moves to
`5174` if that port is taken — which then shows up as a CORS error rather than a
port error. Setting `server.strictPort` in `vite.config.ts` makes that fail
loudly instead.

