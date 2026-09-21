# COVERS onboarding overview

Governing spec: `SPEC-ONBOARD-001`  
Assessment date: 2026-09-21  
Baseline revision: `325f5e52f9c8e50b24b576777b73ad31da3fc414` (`main`, initially clean)  
Profile: **Full onboarding; unit-first proposed baseline**

## Project purpose and current shape

The repository is a deliberately bug-seeded technical assessment: a storefront for browsing, favoriting, carting, and ordering fictional AI personas. This purpose is claimed by `README.md` and supported by the route/component inventory.

Current request flow is source-confirmed as:

1. React/TanStack Router pages call the browser wrapper in `apps/web/src/lib/api.ts`.
2. The wrapper sends JSON to the hard-coded Fastify origin `http://localhost:3001`, optionally attaching a JWT from `localStorage`.
3. Fastify routes validate some bodies with shared Zod schemas, read identity from `request.user`, and call the in-process database facade.
4. `apps/api/src/db.ts` stores users, carts, favorites, and orders in `Map` instances and seeds persona catalog data at module load.
5. Responses return directly to TanStack Query caches and React views. No durable database, queue, payment processor, or email integration exists in the inspected source.

## Stack and components

| Area | Source-backed current state |
|---|---|
| Workspace | pnpm 9.15.0 + Turborepo; four workspace projects including the root |
| Web | React 19, Vite 6, TanStack Router/Query, Tailwind CSS 4 |
| API | Fastify 5, `@fastify/cors`, `@fastify/jwt`, TypeScript/tsx |
| Shared | Zod schemas and inferred TypeScript types consumed by API and web |
| Persistence | Process-local maps; all mutable state is lost on restart |
| Generated code | `apps/web/src/routeTree.gen.ts` from TanStack Router; marked generated |
| External network | DiceBear avatar URLs in seeded data; npm public registry configured for dependency acquisition |

## Authentication and trust boundaries

Registration and login issue JWTs. Browser tokens are persisted in `localStorage`. Authentication is enforced only when `ENFORCE_AUTH` equals the literal string `true`; otherwise the middleware returns before JWT verification while protected handlers still assume `request.user.id`. Authorization is implemented ad hoc in route handlers. Cart update checks ownership; cart delete does not. The API binds to `0.0.0.0`, while CORS permits the localhost web origin and only GET/POST/PUT/OPTIONS.

The project is an exercise, not a verified production deployment. Actual runtime configuration, reverse proxying, TLS, secret injection, token expiry/revocation, and deployment controls are unknown.

## Existing guidance, specs, tests, and CI

- No pre-existing `AGENTS.md`, COVERS records, nested agent guidance, CI configuration, project test files, test script, test runner, or coverage configuration was found.
- `.lore/specs/add-eci-yml/` is retained unchanged as a legacy record for repository metadata. Disposition: retain/coexist; no status or approval is inferred.
- Configured root commands: build, dev, lint, typecheck, clean. Build/typecheck delegate through Turborepo. Root lint is configured, but no workspace has a lint task.
- None of build, dev, lint, typecheck, tests, coverage, or application commands was executed during onboarding.

## Quality and security posture

Static inspection found multiple likely functional defects and material authentication risks. Canonical details are in `functional-findings.md` and `security-findings.md`. Evidence is limited to inspected source/configuration: no application defect is reproduced yet.

The strongest first investigation is the authentication/ownership boundary: establish expected fail-closed behavior, then characterize missing/invalid/valid identity and cross-user cart mutation using Fastify injection without starting a listener. This is both high impact and a useful testability probe.

## Profile decision and reconciliation

Full is proportionate because the assessment crosses frontend, API, shared contracts, identity, authorization, persistence, and many candidate defects. Formal findings and traceability reduce the risk of repairing deliberately seeded symptoms without an agreed contract. The first executable baseline remains unit-first; Full does not mandate browser infrastructure.

COVERS 0.6.7 was adopted from source commit `78bb5729bc628f9eadefc01ec6d24c9d9f4bfd35` (clean per `.covers/adoption.json`). All prior application files, `.lore`, manifests, lockfiles, Git metadata, and generated conventions remain untouched.

## Known unknowns and deferred evidence

- Actual compile, typecheck, build, lint, runtime, and browser outcomes.
- Which seeded defects are intended assessment targets versus incidental issues.
- Approved semantics for checkout cart clearing, token/session lifetime, password policy, and user-facing error recovery.
- CI/branch protection outside this repository and any production environment.
- Dependency advisory status and exploitability; no external advisory query was authorized or made.
- Cold-session discovery of newly installed `.agents/skills`: the optional fresh-process probe exited before initialization with an `unknown` diagnostic category. Local skill bytes passed audit and the current helper works, but a normal fresh Codex launch is still required to verify catalog discovery and activation.
