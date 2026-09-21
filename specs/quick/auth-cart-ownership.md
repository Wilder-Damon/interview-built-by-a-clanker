# Quick spec — enforce authentication and cart ownership

## Outcome

Protected API operations always require a valid JWT, independent of environment flags. Public registration, login, persona browsing, and health behavior remain unchanged. A user cannot delete another user's cart item: both a missing item and a non-owned item return `404`, the owner's state remains unchanged, and the owner can still delete the item.

Accepted behavior for this task:

- Missing, malformed, or unverifiable JWTs receive `401 { "error": "Unauthorized" }` on protected routes.
- Valid JWTs continue to establish `request.user` and allow authorized operations.
- Cart deletion requires `item.userId === request.user.id`; non-ownership is intentionally indistinguishable from absence.
- This resolves only `SEC-001` and `SEC-004`; it does not accept or resolve other security findings.

## Boundaries

Task workflow: **Lite at the user's explicit request**. The code change is small and reversible, and the approved behavior can be exercised entirely through deterministic in-process Fastify injection. Authentication/authorization normally favors Full; promote immediately if the change requires token lifecycle, password policy, storage, migration, external identity, compatibility exceptions, or broader route redesign.

In scope: `apps/api/src/middleware/auth.ts`, cart deletion ownership enforcement, focused API security regressions, security/findings guidance reconciliation, and existing lint/test/typecheck/build gates.

Out of scope: JWT secret/expiry/rotation/revocation (`SEC-002`), password hashing (`SEC-003`), browser token storage/XSS posture (`SEC-005`), abuse controls (`SEC-006`), bind/network policy (`SEC-007`), frontend redesign, persistence changes, real credentials, services, application backend traffic, advisory queries, hooks, CI, commits, pushes, and deployment.

No environment variable may disable authentication after this repair. No real credentials or tokens may appear in tests or records.

## Verification

1. Add in-process Fastify tests using synthetic users/secrets only; do not call `listen()`.
2. Before repair, require meaningful failures for missing/malformed JWT rejection under the default environment and for attacker deletion of an owner's cart item.
3. Preserve valid behavior: registration remains public, a valid owner token can add/read/delete its cart item, unauthorized rejection does not mutate state, and non-owner/missing deletion share the 404 response.
4. Apply the smallest middleware and ownership checks; retain the same regressions green.
5. Run `corepack.cmd pnpm lint`, `corepack.cmd pnpm test`, and `corepack.cmd pnpm typecheck`. Attempt `corepack.cmd pnpm build` and retain the known host limitation if it recurs.
6. Review source, test, generated-file, manifest/lockfile, and security-register diffs. Passing injection tests cover only the tested API boundary, not production security.

## Deferred work

- `SEC-002`, `SEC-003`, `SEC-005`, `SEC-006`, and `SEC-007`: project owner; require separate policy decisions and preferably Full specs before nonlocal exposure or release.
- Complete protected-route matrix across favorites, checkout, and `/auth/me`: project owner; revisit before release. The shared middleware is covered directly here, while route registration presence remains source-inspected.
- Token expiry/revocation and restart/persistence behavior: project owner; revisit before any production-readiness claim.
- Independent security review and browser/E2E: project owner; revisit before promotion or release.

## Results and reconciliation

Approved by the user on 2026-09-21 through the request to create the quick spec and complete the recommended authorization slice.

- Red evidence: `corepack.cmd pnpm test -- apps/api/src/routes/authz-regressions.test.ts` executed 1 file and 2 tests; both failed on the intended defects. Missing authentication returned 500 instead of 401, and an attacker deleted the owner's item with 200 instead of receiving 404. Harness/setup completed normally.
- Repair: removed the `ENFORCE_AUTH` bypass so the shared middleware always verifies JWTs and returns the uniform 401 response; cart DELETE now applies the same ownership predicate already used by PUT.
- Focused green: the identical command passed 1/1 file and 2/2 tests. It verifies missing/malformed rejection, unchanged owner state after attacker rejection, indistinguishable absent/non-owned 404 responses, and successful owner add/read/delete.
- Broader green: `corepack.cmd pnpm test` passed 4/4 files and 12/12 tests; `corepack.cmd pnpm lint` passed with 34 files measured, the four reviewed legacy allowances unchanged, and no new diagnostics; `corepack.cmd pnpm typecheck` passed 4/4 Turbo tasks.
- Build: `corepack.cmd pnpm build` again failed before web compilation because the host's Node `os.userInfo()` returned the previously reproduced `uv_os_get_passwd ... ENOMEM`. This remains a failed/deferred production-build gate, not a security-test or compile pass.
- Limitations: Fastify injection did not start a service, exercise browser flows, prove every protected route registration, assess token lifecycle/secret strength, or establish production security. No package, manifest, or lockfile change was needed for this slice.

`SEC-001` and `SEC-004` are resolved for the tested source boundary. All other security findings remain open. No security risk was accepted, and no service, real credential, backend traffic, hook, CI change, commit, push, or deployment was used.
