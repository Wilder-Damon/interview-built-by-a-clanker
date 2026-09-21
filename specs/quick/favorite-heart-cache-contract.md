# Quick spec — repair the favorite heart interaction

## Outcome

For a signed-in user on a persona detail page, the heart reflects whether that persona is currently saved. Activating an unselected heart adds the favorite; activating a selected heart removes it. The detail and Favorites routes share one user-scoped React Query cache entry with one canonical API-response shape, so navigation order cannot break heart state. The heart has an accessible state-specific name.

## Boundaries

Task workflow: **Lite**. This is a localized, reversible React Query/UI contract correction with an explicit interaction outcome and existing test infrastructure. The user authorized the repair through the 2026-09-21 request to fix the heart using a quick spec.

In scope: the persona-detail favorites query, heart button semantics, focused route regression tests, this quick note, and reconciliation of the high-level remediation tracker if a new item is recorded.

Out of scope: API schema changes, authentication or token policy, persistence, optimistic updates, the Favorites-page layout, new dependencies, browser/E2E infrastructure, services, external backends, build-host repair, commit, push, or deployment.

Preserve the user-scoped key `['favorites', user.id]`; cache a single `{ favorites: Persona[] }` response shape and derive detail-page IDs with a query selector. Reassess if the defect requires server or authentication changes.

## Verification

1. Add a focused regression proving both routes use the same raw favorites response shape while the detail route derives IDs through `select`; run it before the implementation change and retain the meaningful assertion failure.
2. Exercise the rendered heart button and verify its accessible state name and absent-favorite POST behavior.
3. Apply the smallest implementation change, then rerun the identical focused file with a nonempty passing selection.
4. Run the existing complete test command, typecheck, and ESLint ratchet. Do not retry the already-characterized host-blocked build unless the environment changes.
5. Review the diff and record exact command results and limitations below.

## Deferred work

- Browser-faithful confirmation: deferred because the project has no approved browser/E2E infrastructure. Owner: project owner. Revisit before release or any browser-readiness claim.
- Optimistic heart updates during API latency: deferred because canonical refetch behavior is the bounded repair. Owner: project owner. Revisit if observed latency remains a usability problem after browser verification.
- Production build: remains blocked by the previously reproduced host `node:os.userInfo()` `ENOMEM` failure. Owner: project owner. Revisit on a healthy host before release.

## Results and reconciliation

Approved by the user on 2026-09-21 through the request to fix the heart using a quick spec.

- Root cause: the persona-detail and Favorites routes used the same user-scoped React Query key with incompatible cached values. The detail query stored `string[]`; the Favorites query stored `{ favorites: Persona[] }`. Navigation order could therefore empty or break the heart state.
- Red evidence: `corepack.cmd pnpm test -- apps/web/src/routes/ui-route-regressions.test.tsx` executed 1 file and 7 tests; 5 passed and the 2 intended regressions failed. The detail query returned `['p-test']` instead of the canonical API object, and the rendered heart had no accessible `Add to favorites` action name.
- Repair: the shared cache now retains the API response object and the detail route derives favorite IDs through React Query `select`. The heart is a focused button component with state-specific accessible naming and `aria-pressed`, while preserving the existing add/remove endpoints and user-scoped invalidation.
- Focused green evidence: the identical focused command executed 1 file and passed 8/8 tests, including absent-favorite add, selected-favorite removal, canonical cache shape, and rendered heart interaction.
- Combined green evidence: `corepack.cmd pnpm test` passed 4/4 files and 15/15 tests; `corepack.cmd pnpm typecheck` passed 4/4 Turbo tasks; `corepack.cmd pnpm lint` passed over 34 measured files with no new or resolved allowances. An intermediate lint run correctly failed on one new complexity diagnostic; extracting the heart component removed that diagnostic without changing the reviewed baseline.
- Deferred: no browser, service, backend, coverage, advisory, build, commit, push, or deployment command was run. The production build remains blocked by the previously reproduced host `node:os.userInfo()` `ENOMEM` failure and was not retried.

These passing checks establish only the selected cache, click, type, and ratchet scopes; they do not prove browser, backend, persistence, security, or release readiness.

This quick spec can be promoted to Full at any time, including while incomplete. Carry forward intent, decisions, results and open obligations, and link the resulting Full spec here as the current authority. Promotion does not mean completion or release approval; follow `.covers/methodology/workflows/lite.md`.
