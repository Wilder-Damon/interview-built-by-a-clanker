# Quick spec — repair the known UI-facing defects

## Outcome

The storefront presents consistent prices and identity, performs the intended favorite/cart interactions, refreshes cached UI data when effective inputs change, does not retain a token after logout, and permits its configured browser DELETE requests. Focused regressions fail against the current defects and pass after the repair; root typecheck and build remain green.

Covered findings and intended behavior:

- `FUNC-002`: persona cards display the stored monthly price, consistent with detail/cart views.
- `FUNC-003`: an absent favorite is added; an existing favorite is removed.
- `FUNC-005`: a successful login response includes the user's username displayed by the root layout.
- `FUNC-006`: logout removes the persisted auth token as well as in-memory identity.
- `FUNC-007`: persona query identity changes with effective browse/search parameters.
- `FUNC-008`: header and cart pages share user-scoped cart query identity; cart mutations invalidate that family.
- `FUNC-009`: the API CORS policy permits DELETE used by cart/favorite UI actions.
- `FUNC-010`: quantity cannot decrement below the API's minimum of one.
- Related discovered case: anonymous persona detail does not request the protected favorites endpoint; favorite caches are user-scoped.

## Boundaries

Task workflow: **Lite**. The changes are localized, reversible UI/transport contract corrections with explicit observable outcomes. The user authorized fixing all UI bugs and previously authorized required package installation.

In scope: focused React/API configuration tests, the smallest compatible local test tooling, UI source changes, the login response shape, CORS method configuration, package scripts/manifests, and the lockfile.

Out of scope: `FUNC-001` price filtering, `FUNC-004` checkout clearing, authentication enforcement/password/JWT/ownership security findings, durable persistence, broad accessibility redesign, new browser/E2E infrastructure, services, external backends, dependency upgrades unrelated to test setup, CI, commit/push/deploy.

Promote or stop if implementation requires security-policy decisions, state migration, or materially broader architecture changes.

## Verification

1. Install exact compatible project-local test dependencies with lifecycle scripts and audit disabled; record manifest/lock changes.
2. Add focused tests that reproduce each covered defect or exercise its extracted contract. Run the selected tests before repairs and retain genuine assertion failures separately from harness failures.
3. Apply the smallest fixes; do not hand-edit `routeTree.gen.ts`, weaken types, suppress diagnostics, or change unrelated behavior.
4. Rerun the identical focused tests and require a nonempty passing selection.
5. Run `corepack.cmd pnpm typecheck` and `corepack.cmd pnpm build`; record task counts, exits, and limitations.
6. Review source, generated, manifest, and lockfile diffs. Browser/E2E remains explicitly unverified.

## Deferred work

- Browser-faithful interaction/CORS confirmation: deferred because no browser infrastructure exists. Owner: project owner. Revisit before claiming production browser readiness.
- Broader coverage target and all-owned-source denominator: deferred for a dedicated baseline. Owner: project owner. Revisit before promotion/release.
- Security findings and non-UI product semantics: excluded from this task and retained in the existing findings registers. Revisit under separate approved records.

## Results and reconciliation

Approved by the user on 2026-09-21 through the request to fix all UI bugs in this quick spec.

- Dependency preparation: an initial exact dev-dependency add failed before writes with `ERR_PNPM_UNEXPECTED_STORE`. Retrying against the existing pnpm store succeeded with lifecycle scripts and audit disabled, adding exact `vitest@3.2.4`, `jsdom@26.1.0`, and `@testing-library/react@16.3.0`; the manifest and lockfile were updated. A following frozen, script-disabled install succeeded. No package lifecycle scripts ran.
- Red evidence: `corepack.cmd pnpm test` executed 3 focused files and 10 tests; all 10 failed on the intended pre-repair behaviors, with no harness errors after cleanup. This reproduced `FUNC-002`, `FUNC-003`, `FUNC-005` through `FUNC-008`, `FUNC-010`, and the anonymous-favorites request; `FUNC-009`'s missing CORS method was observed by configuration assertion, not through a browser preflight.
- Green evidence: the identical command passed 3/3 files and 10/10 tests after the repairs.
- Type gate: `corepack.cmd pnpm typecheck` passed 4/4 Turbo tasks across shared, API, and web packages.
- Build gate: `corepack.cmd pnpm build` failed twice before web compilation because Node `v22.23.2` returned `uv_os_get_passwd ... ENOMEM` while Vite/tsx loaded `vite.config.ts`. A standalone `node:os.userInfo()` diagnostic reproduced the host failure. This is a failed/deferred production-build gate, not evidence of a project compile defect or a pass.
- Diff/accountability review: `git diff --check` passed. The generated `apps/web/src/routeTree.gen.ts` remains byte-identical to `HEAD` despite a worktree stat/line-ending warning (matching Git object hash `0c2685a...`), so it was not hand-edited. Optional COVERS drift reporting exited 0 with the expected `unmapped` advisory outcome because Lite quick-note meaning is not formally mapped; it reported no operational errors.
- Deferred: browser-faithful interaction and CORS preflight, coverage measurement, and the production build on a host where `node:os.userInfo()` succeeds. Lint remains unexecuted because the configured root task has no effective workspace lint tasks.

No service, application backend, advisory service, browser, hook, commit, push, or deployment was used.
