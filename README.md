# Language Guide Web

Phase 10 expands the German curriculum after the completed foundation, learning, personal features, practice, offline, polish, testing, and authentication phases. A1 meets its authored count gate. A2 and B1 have complete 42-lesson structures, but their synthetic supplemental vocabulary is quarantined while it is replaced with individually authored material. Native-speaker review and the real learner pilot remain in progress.

## Implemented surface

- Responsive dashboard with current lesson, daily review, and account-backed progress
- First-party registration, login, logout, secure session cookies, and account lockout protection
- Accurate streaks, active days, tracked minutes, completions, saved words, reviews, and quiz bests calculated from recorded events in the learner's timezone
- Focused German curriculum with supported A1, A2, and B1 learning paths
- Authenticated, durable enrollment save/read flow
- One hundred twenty-six complete German lessons across A1–B1: forty-two lessons at each level
- A reordered A1 foundation chapter covering spelling, pronunciation, and core German sentence structure
- A second reviewed A1 chapter covering personal details, family and home, and daily routines
- A third reviewed A1 chapter covering groceries, local transport, and simple appointments
- A fourth reviewed A1 chapter covering health basics, weather and clothing, and leisure plans
- An A1 calendar and identity chapter covering dates, origin and languages, forms, contact details, and negation
- An A1 work and study chapter covering classroom language, present-tense endings, study habits, workplace communication, and basic connectors
- An A1 home and neighborhood chapter covering furniture, `es gibt`, dative locations, public services, and opening hours
- An A1 food and shopping chapter covering meals, preferences, restaurant service, clothes, colors, sizes, and polite orders
- A1 travel, communication, safety, grammar-consolidation, bridge, and cumulative production chapters
- Exactly 1,000 reviewed A1 vocabulary/form cards and 300 reusable A1 sentence cards, balanced across practical themes
- A complete 14-chapter A2 sequence with 318 reusable sentence cards and a vocabulary bank under quality rebuild
- A complete 14-chapter B1 sequence with 318 reusable sentence cards and a vocabulary bank under quality rebuild
- Multi-chapter German course contracts with stable course and chapter lesson ordering
- Chapter-aware learning maps with both chapter and overall course progress
- Sequential signed-in progression with enforced prerequisites and a deterministic next-lesson recommendation
- 21-question A1, A2, and B1 final assessments across vocabulary, sentences, grammar, reading, listening, writing, and speaking, with tolerant word-order-aware matching for controlled production
- Persisted mastery gates at every level requiring every lesson, 80%+ lesson quizzes, 80% overall on the final, 70% in every skill, and no due review backlog before recommending the next level
- Vocabulary pronunciation, contextual phrases, focused grammar, and a mini dialogue
- German-only voice selection with loaded-voice waiting, interruption-safe playback, and clear unsupported-device feedback
- Installable PWA runtime with an offline lesson library and explicit per-lesson downloads
- IndexedDB lesson snapshots plus a durable authenticated mutation queue
- Deterministic conflict handling for saved vocabulary and idempotent assessment replay
- Guided practice and a five-question quiz with accessible answer feedback and retries
- Server-only answer keys, immutable attempt snapshots, idempotent writes, and saved best scores
- A real course map and dashboard recommendation driven by saved progress
- Account-backed vocabulary bookmarks with soft deletion and safe reactivation
- Searchable personal library with lesson provenance and review status
- Due review queue with reveal-first cards and Again, Hard, Good, and Easy ratings
- Pure, deterministic review scheduling with persisted history and idempotent submissions
- Dashboard review totals driven by the authenticated learner's real queue
- Level-aware German A1–B1 mixed workouts with word scramble, sentence builder, matching, and missing-word rounds
- Reproducible seeded puzzle generation with browser-safe public contracts and server-only answers
- Anonymous practice with optional authenticated result persistence and idempotent retries
- Automated editorial validation for stable IDs, answer integrity, and required lesson structure
- A transparent curriculum audit for vocabulary, useful sentences, assessments, internal review, native-speaker review, and learner-pilot status
- Deterministic seeded vocabulary exercise generation with a replayable policy version
- Global search across all German A1–B1 lessons, vocabulary, phrases, translations, and grammar
- A complete Progress page with transparent counting rules and honest anonymous/empty states
- App-wide skip navigation, visible focus treatment, and accessible route landmarks
- Focus-managed lesson, practice-result, and review transitions with reduced-motion support
- Screen-reader-friendly loading, error, offline, and progress states
- Light, dark, and system theme support with persisted preference
- Loading, error, and not-found states
- Installable web-app manifest and custom favicon
- WebMCP tools for listing and selecting supported German levels where available

## Architecture

```text
app/                    routes, route handlers, and delivery UI
components/             reusable design-system and feature components
packages/domain/        pure product rules and value types
packages/application/   use cases and ports
packages/contracts/     boundary validation schemas
infrastructure/         catalog and provider adapters
content/                reviewed, versioned editorial source outside the UI
db/                     Drizzle schema and database access
drizzle/                immutable generated migrations
tests/                  deterministic domain tests
```

The application layer depends on domain types and ports. Infrastructure implements those ports. UI and API routes adapt requests and responses but do not own business rules.

## Commands

```text
npm run dev          local development server
npm run typecheck    strict TypeScript validation
npm run content:validate validate authored content and references
npm run curriculum:audit report progress against the A1-B1 release gates
npm test             Node test runner
npm run check        typecheck and tests
npm run db:generate  generate an append-only Drizzle migration
npm run build        production Worker build
```

## Authentication

Learners can create an account with a name, email address, and password. Passwords are processed with PBKDF2-HMAC-SHA-256 using a unique random salt and 310,000 iterations. The browser receives an opaque 30-day HTTP-only, SameSite cookie; only a SHA-256 hash of its token is stored in D1. Five failed password attempts lock the credential for 15 minutes, authentication writes require a same-origin request, and return paths are restricted to safe internal URLs. Hosted platform identity headers remain supported when the app runs behind the trusted platform. `/api/v1/me/*` rejects anonymous requests.

The initial authentication scope does not yet include email verification or password-reset email delivery; those require a transactional email provider before a public launch.

## Persistence

`.openai/hosting.json` declares the logical `DB` D1 binding. Runtime schema creation is forbidden; `drizzle/*.sql` migrations own schema changes. User-scoped writes use prepared, validated Drizzle queries and server-derived identity.

## Phase boundary

The product proves the authored-content → lesson → assessment → progress loop, the save → library → review → reschedule loop, the generate → play → grade → persist puzzle loop, the level-test → skill feedback → recommended review loop, and the download → learn offline → queue → reconcile loop. It does not yet meet the self-contained strong-B1 outcome gate: run `npm run curriculum:audit` and see `CURRICULUM.md` plus `quality/self-contained-b1-plan.md`. See `OFFLINE.md` for storage, privacy, sync, and conflict rules.
