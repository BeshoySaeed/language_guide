# Language Guide Web

Phase 2 establishes the production foundation for Language Guide: a responsive Vinext/React application, strict TypeScript domain boundaries, versioned HTTP APIs, authenticated user state, D1 persistence, schema migrations, theme support, PWA metadata, and baseline tests.

## Implemented surface

- Responsive dashboard with current lesson, daily review, streak, and meaningful progress
- Language/CEFR selection for English, German, and Spanish across A1–B2
- Authenticated, durable enrollment save/read flow
- Structured German A1 lesson foundation driven by catalog data rather than UI arrays
- Search over the current structured sample content
- Honest empty states for Practice, Review, Library, and Progress
- Light, dark, and system theme support with persisted preference
- Loading, error, and not-found states
- Installable web-app manifest and custom favicon
- WebMCP tools for listing and selecting learning languages where supported

## Architecture

```text
app/                    routes, route handlers, and delivery UI
components/             reusable design-system and feature components
packages/domain/        pure product rules and value types
packages/application/   use cases and ports
packages/contracts/     boundary validation schemas
infrastructure/         catalog and provider adapters
db/                     Drizzle schema and database access
drizzle/                immutable generated migrations
tests/                  deterministic domain tests
```

The application layer depends on domain types and ports. Infrastructure implements those ports. UI and API routes adapt requests and responses but do not own business rules.

## Commands

```text
npm run dev          local development server
npm run typecheck    strict TypeScript validation
npm test             Node test runner
npm run check        typecheck and tests
npm run db:generate  generate an append-only Drizzle migration
npm run build        production Worker build
```

## Authentication

Hosted identity is supplied by the platform and read only on the server. `/api/v1/me/*` rejects anonymous requests. Local development can use the starter's loopback-only sign-in route.

## Persistence

`.openai/hosting.json` declares the logical `DB` D1 binding. Runtime schema creation is forbidden; `drizzle/*.sql` migrations own schema changes. User-scoped writes use prepared, validated Drizzle queries and server-derived identity.

## Phase boundary

This is the Phase 2 foundation, not the full learning core. Books, complete lessons, exercise generation, quizzes, personal library behavior, spaced repetition, and offline synchronization are implemented in later phases against these contracts and tables.

