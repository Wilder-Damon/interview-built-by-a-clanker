# Security findings — authentication and user-owned state

Mode: exercise  
Governing spec: `SPEC-ONBOARD-001`  
Revision/scope: static source inspection at `325f5e52f9c8e50b24b576777b73ad31da3fc414`; no live system or third party contacted  
Risk owner: pending; exercise findings are not production risk acceptance

Later repair evidence for `SEC-001` and `SEC-004` is governed by `specs/quick/auth-cart-ownership.md`; other rows retain their original assessment scope.

| ID | Summary and source | Evidence | Severity/exposure | Disposition / status | Verification proposal |
|---|---|---|---|---|---|
| SEC-001 | Authentication was opt-in, causing protected handlers to execute without identity (`apps/api/src/middleware/auth.ts`; `apps/api/src/routes/authz-regressions.test.ts`). | Reproduced | High if reachable | Resolved / approved repair | Missing and malformed JWT injection now returns 401; valid ownership flow passes. Expired-token matrix remains deferred. |
| SEC-002 | JWT signing uses the literal `agentic-personas-dev-secret` with no explicit expiry/rotation/revocation (`apps/api/src/index.ts:17`; auth routes). | Observed | High outside isolated demo; exposure context unknown | Proposed / open | Configuration test and token lifecycle policy decision |
| SEC-003 | Passwords use a fast unsalted custom integer hash (`apps/api/src/routes/auth.ts:8-16`). | Observed | High for any retained credential data | Proposed / open | Approve KDF/password policy separately; never use real credentials in tests |
| SEC-004 | Cart DELETE lacked the ownership check used by PUT (`apps/api/src/routes/cart.ts`; `apps/api/src/routes/authz-regressions.test.ts`). | Reproduced | High horizontal authorization risk when IDs are known | Resolved / approved repair | Two-user injection passes: attacker receives non-revealing 404, owner state is unchanged, owner delete succeeds |
| SEC-005 | Browser JWT remains stored in `localStorage` (`apps/web/src/lib/api.ts`; `apps/web/src/lib/auth.tsx`). Logout removal and user-scoped cache identity were repaired separately, but XSS/storage posture remains unassessed. | Observed | Medium/high on shared browser or script injection; XSS posture unassessed | Proposed / open | Decide storage model separately; add browser-faithful logout/reload/account-switch verification |
| SEC-006 | No login/register throttling, lockout, recovery, MFA, or abuse control appears in the inspected API. | Suspected | Context-dependent; API binds all interfaces in source | Proposed / investigating | Confirm exercise-only boundary and intended exposure before remediation |
| SEC-007 | API source binds `0.0.0.0` while secrets/auth defaults are development-oriented (`apps/api/src/index.ts:17,28`). | Observed | Context-dependent; actual network controls unknown | Proposed / open | Inspect approved runtime boundary before any service start |

No dependency advisory query was made. The offline lock inventory contains 306 exact package-version records, all conservatively classified `unknown`; that is neither a vulnerability finding nor security clearance.

No residual risk is accepted. Business agreement that a behavior is intentional would not accept the associated security risk.
