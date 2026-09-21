# First baseline and findings review proposal

Governing record: `SPEC-ONBOARD-001`  
Selected depth: **unit-first**  
Current authority: planning only; do not execute project checks or edit application/tests without approval

## Immediate bounded verification batch proposed for approval

Run sequentially from the repository root, with no services, browsers, containers, backend traffic, external advisory calls, or source edits:

1. `corepack.cmd pnpm typecheck`
2. `corepack.cmd pnpm build`
3. `corepack.cmd pnpm lint`

Stop the batch after any command failure and retain its full exit/output. Confirm Turborepo task counts; a zero-task lint exit is evidence of an ineffective configured check, not a pass. Suggested total timeout: 10 minutes. This batch establishes only compiler/bundler/lint baselines and may reveal effects of skipped lifecycle scripts.

## Unit-first characterization after behavior approval

Use existing Node 22, `tsx`, TypeScript, Fastify injection, and project modules; do not install a test runner initially.

| Priority | Behavior | Proposed layer | Evidence goal |
|---|---|---|---|
| 1 | Authentication defaults and user ownership | Fastify injection without `listen()` | Missing/invalid identity rejects; owner succeeds; cross-user cart deletion leaves state unchanged |
| 2 | Persona price bounds | Pure unit | Below/equal/above min/max and combined bounds independently expected |
| 3 | Auth response/session transitions | API injection + React component/unit where feasible | Username contract; logout/reload token removal; account-scoped cache state |
| 4 | Cart/favorites/checkout transitions | Unit/injection | Correct toggle direction, cart-count invalidation, quantity boundary, approved checkout clearing semantics |
| 5 | Browser-only CORS/UI behavior | Focused integration/browser only when authorized | DELETE preflight and rendered interaction; not claimed from unit evidence |

Before adding tests, approve exact intended behavior and create a child spec. Preserve valid existing behavior, retain each meaningful diagnostic red before repair, and keep the regression in the normal suite after green. Harness/import/setup failures are not product-red evidence.

## Coverage and owned deferrals

No coverage reporter exists. Propose Node's compatible local coverage path only with the test-spec approval, producing console and machine-readable evidence if supported and explicitly accounting for all 33 owned `.ts/.tsx` source files, excluding generated `routeTree.gen.ts` with rationale. A loaded-module-only report is partial.

| Deferred item | Remaining uncertainty | Owner | Revisit trigger |
|---|---|---|---|
| Browser/E2E | Real navigation, preflight, accessibility, and browser storage behavior unverified | Unassigned | Before claiming a browser-specific repair fixed or release readiness |
| Service startup/shutdown | Listener identity, egress, health, cleanup unverified | Unassigned | Before first authorized local demo |
| External advisory query | Dependency vulnerabilities/reachability unknown | Unassigned | Separate privacy-reviewed authorization |
| Production/deployment | Secrets, TLS, persistence, network controls, monitoring unknown | Unassigned | Before any nonlocal exposure or release decision |

