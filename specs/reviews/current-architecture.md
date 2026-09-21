# Discovered current architecture

Governing spec: `SPEC-ONBOARD-001`  
Source revision: `325f5e52f9c8e50b24b576777b73ad31da3fc414`; onboarding files are uncommitted additions  
Evidence legend: **source-confirmed** = directly inspected source/config; **claimed-only** = documentation; **inferred** = reasoned but not executed; **unknown** = not established.

## System context

The system presents a single-user-facing storefront SPA backed by one JSON API process. A visitor can browse personas; a registered user is intended to maintain favorites/cart and submit an order. No administrator, seller, payment, or fulfillment actor is implemented. `README.md` calls this a debugging assessment (**claimed-only**); the route set supports that description (**source-confirmed**).

## Components and ownership

| Component | Responsibility and interfaces | Runtime/ownership | Evidence |
|---|---|---|---|
| `apps/web` | SPA routes, auth context, TanStack Query caches, JSON client | Browser; owner unknown | Source-confirmed |
| `apps/api` | Fastify routes for auth, personas, cart, favorites, checkout, health | Node process on port 3001; owner unknown | Source-confirmed |
| `packages/shared` | Zod request/domain schemas and inferred types | Built workspace library consumed by both apps | Source-confirmed |
| `apps/api/src/db.ts` | Seed catalog and mutable user/cart/favorite/order maps | Same API process and lifetime | Source-confirmed |
| `routeTree.gen.ts` | Generated TanStack route graph | Web build artifact source | Source-confirmed |

## Data and control flows

- Browse: route search parameters → `URLSearchParams` → GET `/personas` → unvalidated query coercion → in-memory filter/sort → persona JSON → cached React grid.
- Authentication: registration/login form → shared Zod validation → in-memory user lookup/write → custom password hash → JWT sign → token/user stored in browser state and token in `localStorage`.
- Session restore: browser token → GET `/auth/me` → optional JWT middleware → `request.user` lookup → user response. The disabled-auth default conflicts with handler assumptions; runtime result is unverified.
- Cart/favorites: browser mutation with bearer token → route-level auth hook → user-keyed in-memory collections → enriched persona response → query invalidation. Cache keys do not consistently include identity.
- Checkout: browser name/email → shared validation → current user's cart entries → order snapshot in memory → 201 response. No payment/email/deployment action occurs despite UI copy.

## State, persistence, and lifecycle

All server state is memory-only. IDs are incrementing process-local counters. There are no transactions, backups, migrations, retention policy, concurrency controls, or restart recovery. Persona seed state is recreated at module import. Cart is not cleared in the checkout route. Browser auth state and some server-derived caches can outlive an in-memory UI user transition.

## Integrations and trust boundaries

- Untrusted boundaries: URL query strings, route parameters, JSON request bodies, bearer tokens, and browser local storage.
- Validation is mixed: auth/cart/checkout bodies use Zod; persona queries and favorite POST use manual casting/checks.
- Authentication is controlled by `ENFORCE_AUTH`; authorization is local to each handler and inconsistent.
- Secrets: JWT secret is a source literal. No environment-backed secret name is defined.
- External browser request: persona avatar images point to `https://api.dicebear.com`. This may disclose client network metadata; actual requests were not observed.
- Package source: configured npm registry is `https://registry.npmjs.org/`; install reused cache and downloaded nothing.

## Runtime and deployment

The API source listens on `0.0.0.0:3001`; Vite declares port 5173. CORS names `http://localhost:5173`. There is a `/health` route. No container, process manager, production config, infrastructure, TLS, or deployment manifest was found. Runtime claims are source-confirmed configuration, not observed listeners.

## Build, test, and observability topology

Turborepo coordinates build/typecheck/lint. Shared build is an upstream dependency of downstream tasks. API logs through Fastify's logger and also writes a startup message; no metrics, traces, alerts, or structured audit events were found. No tests, coverage tool, CI configuration, or lint implementation was found. The application commands remain unexecuted.

## Contradictions, risks, and unknowns

| ID | Missing/conflicting evidence | Impact | Required validation/decision | Status |
|---|---|---|---|---|
| ARCH-Q-001 | Auth defaults off while protected handlers require `request.user` | Security exposure and likely runtime failures | Decide fail-closed policy; inject missing/invalid/valid identities | Proposed investigation |
| ARCH-Q-002 | README says recently working; no retained test/build evidence exists | Baseline health unknown | Run approved static verification batch | Deferred for approval |
| ARCH-Q-003 | Checkout UI promises deployment/email, but no integration exists | Misleading product behavior | Stakeholder decision on demo copy versus missing functionality | Proposed |
| ARCH-Q-004 | No durable state or production topology | Restart loss and deployment ambiguity | Confirm exercise-only boundary or define target architecture separately | Unknown |
| ARCH-Q-005 | Newly copied skills not cold-discovered in this live session | Team activation incomplete | Fresh Codex process catalog check | Deferred to cold restart |

## Target architecture and recommendations

No target architecture is approved. Candidate improvements—fail-closed auth, environment-managed secrets, password KDF, consistent ownership enforcement, durable persistence, scoped query caches, and tests—remain proposals requiring separate specs and decisions.

