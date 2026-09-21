# ESLint quality baseline and ratchet review

Governing quick note: `specs/quick/eslint-ratchet.md`  
Owner/environment/source snapshot: project owner; Windows; Node `v22.23.2`; pnpm `9.15.0`; working tree includes the approved onboarding, typecheck, and UI-repair work

| Check/component | Command and working directory | Tool/version/config | Measured files/exclusions | Exit/result/evidence |
|---|---|---|---|---|
| Previous root lint | `corepack.cmd pnpm lint` from repository root | Turbo 2.8.20; no workspace lint scripts | Zero linted files; one cached shared build task | Exit 0, but no effective lint check |
| ESLint report | `corepack.cmd pnpm lint:report` from repository root | ESLint 10.10.0; `eslint.config.mjs`; syntax-level recommended rules plus observational complexity/max-params | 33 owned TS/TSX files; generated route tree and non-source/tooling excluded | Exit 1: 4 diagnostics (2 errors, 2 warnings) |
| Reviewed ratchet | `corepack.cmd pnpm lint` from repository root | COVERS adapter plus `specs/quality/eslint-reviewed.json` | 33 baseline files; latest run 34 files after authorization regression; 4 reviewed allowances | Exit 0: no added/resolved diagnostics |

Current stage per rule: no-new-debt for the reviewed diagnostic identities and multiplicities. Complexity and max-params are warnings but are still ratcheted.

Retained original report and identity: `specs/quality/eslint-candidate-2026-09-21.json` and `specs/quality/eslint-reviewed.json`, byte-identical with SHA-256 `8fa373720daf88922ed4eac814a5ea7164668e7cbea59d686c22719b5897ecd5`.

Diagnostic policy: diagnostics are compared by path, rule, severity, message, source context, and multiplicity. Resolved legacy allowances do not permit a distinct replacement violation. Baselines are never self-updated by checks.

Baseline update authority: project-owner review under a later quality quick spec or formal spec; preserve the previous snapshot before replacement or tightening.

Gate challenges: known pass exited 0; a new unused variable exited 1; removal of an allowed diagnostic exited 0 and reported one resolution; exact reintroduction exited 0 under the retained allowance; missing analyzer, empty scope, and incompatible config/identity each emitted adapter exit 2 with a nonzero process result. Disposable files were removed.

Existing gates preserved: final focused tests passed 3/3 files and 10/10 tests; root typecheck passed 4/4 Turbo tasks. The production build was attempted and failed before web compilation on the previously reproduced host `node:os.userInfo()` ENOMEM; no lint-related build diagnostic was observed.

Reviewed existing debt:

- Error: unused `CartItem` type import in `apps/api/src/db.ts`.
- Error: unused `navigate` value in `apps/web/src/routes/checkout.tsx`.
- Warning: complexity 11 versus observational threshold 10 in `db.personas.search`.
- Warning: complexity 11 versus observational threshold 10 in `BrowsePage`.

These are static diagnostics, not functional defect reproduction. Disposition: deferred; repair requires a separate approved quick note or spec and preservation checks.

CI/hook enforcement: not configured and not implied by local success.

Diff review: `git diff --check` passed. No disposable challenge path remains in Git status. `apps/web/src/routeTree.gen.ts` is excluded as generated and remains byte-identical to `HEAD` (Git object hash `0c2685a5fb57a3817ecace3ed69d0d7671889e2d`). Manifest and lockfile changes are limited to the previously added test tools plus the exact lint dependencies and scripts.

Exceptions: generated `apps/web/src/routeTree.gen.ts` is excluded because its source is generator-owned. Dependencies, build output, coverage, `.covers`, and `.agents` are non-owned/tooling boundaries. No inline source suppressions are permitted by the adapter.

Independent review: proportionately deferred for this Lite task; required gate challenges and diff review substitute only for local implementation confidence, not independent approval.
