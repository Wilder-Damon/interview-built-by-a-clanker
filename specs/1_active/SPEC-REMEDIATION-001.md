---
id: SPEC-REMEDIATION-001
description: Track the Agentic Personas Storefront assessment findings, completed repairs, and remaining modernization work.
status: draft
domain: modernization
sdd_mode: spec-led
parent: null
depends_on: []
amends: []
requirements:
  - id: BR1
    source: conversation:2026-09-21
    summary: Maintain one high-level specification showing the status of all known assessment items.
invariants: []
key_decisions:
  - id: D1
    decision: Keep detailed evidence and disposition in the existing findings, quick notes, and review receipts; use this master as the cross-domain status and sequencing index.
    rationale: A single overview is useful, but duplicating canonical evidence would create conflicting status records.
    alternatives: [Move every detailed finding into this master]
    consequences: [Every status entry links to its governing evidence, future slices reconcile this tracker at closeout]
  - id: D2
    decision: Address remaining high-impact security policy before production-readiness work, while allowing independent bounded functional and quality slices to proceed under their own authority.
    rationale: Credential and token policy carry the highest residual exposure, but unrelated deterministic defects need not wait for one large security program.
    alternatives: [One monolithic remediation project, functional work before security policy]
    consequences: [Security policy work should normally use Full specs, small reversible fixes may use retained quick notes when explicitly selected]
acceptance:
  - id: R1
    description: Every currently recorded functional and security finding appears with evidence state, disposition, governing record, and next decision or verification step.
  - id: R2
    description: Quality, build, browser, coverage, CI, dependency, onboarding, and release-readiness gaps are tracked separately from functional and security findings.
  - id: R3
    description: Resolved items link to actual red-to-green or command evidence, while open, deferred, failed, and unverified items are never presented as passing.
  - id: R4
    description: Future remediation slices update their canonical register and reconcile this master without treating the master as execution authority.
files:
  - {path: AGENTS.md, action: modify, state: changed}
---

# Assessment remediation master

## Authority and purpose

The user requested one high-level specification tracking all known items from the current repository assessment. This draft is a coordination and status record, not blanket approval to repair, install, run services, change policy, accept risk, or release. Detailed findings remain authoritative in `specs/reviews/functional-findings.md`, `specs/reviews/security-findings.md`, `specs/quality/eslint-ratchet-review.md`, and the linked quick notes.

Baseline: branch `main` with local assessment and repair work based on original revision `325f5e52f9c8e50b24b576777b73ad31da3fc414`. The checkpoint is being prepared for the confirmed public fork `Wilder-Damon/interview-built-by-a-clanker`; integration is not claimed until the push is verified.

## Status vocabulary

- **Resolved:** approved repair has relevant passing evidence; scope limitations remain explicit.
- **Open:** action or policy decision remains necessary.
- **Deferred:** intentionally postponed with a trigger; not a pass.
- **Blocked:** attempted verification cannot complete because of a named external/environment condition.
- **Pending decision:** intended product or security behavior is not yet approved.

Evidence (`observed`, `suspected`, `reproduced`) remains separate from disposition.

## Completed or locally resolved items

| Item | Evidence | Disposition | Governing evidence | Remaining limitation |
|---|---|---|---|---|
| TypeScript declaration failure | Reproduced | Resolved | `specs/quick/typecheck-fix.md` | Passing typecheck is limited to configured compiler tasks |
| FUNC-002, FUNC-003, FUNC-005–FUNC-011 | Reproduced or observed per register | Resolved | `specs/quick/ui-bug-fixes.md`; `specs/reviews/functional-findings.md` | Browser-faithful UI/CORS verification deferred |
| QUAL-001 ineffective lint wrapper | Reproduced | Resolved | `specs/quick/eslint-ratchet.md`; `specs/quality/eslint-ratchet-review.md` | Local ratchet only; CI enforcement absent |
| SEC-001 authentication opt-in | Reproduced | Resolved | `specs/quick/auth-cart-ownership.md`; `apps/api/src/routes/authz-regressions.test.ts` | Expired-token and complete route matrix deferred |
| SEC-004 cross-user cart deletion | Reproduced | Resolved | `specs/quick/auth-cart-ownership.md`; `apps/api/src/routes/authz-regressions.test.ts` | In-process boundary only; no production security claim |
| Focused regression baseline | Observed | Resolved for configured scope | Latest recorded run: 4 files, 12 tests passing | No all-owned-source coverage or browser suite |

## Open functional decisions and defects

| Item | Evidence | Disposition | Priority / next step |
|---|---|---|---|
| FUNC-001 reversed minimum-price filter | Observed | Open / proposed | High-value small quick spec: below/equal/above pure-unit red-to-green |
| FUNC-004 checkout does not clear cart | Suspected | Pending decision | Decide intended post-checkout state, then characterize with Fastify injection |

## Open security work

| Item | Evidence | Disposition | Priority / next step |
|---|---|---|---|
| SEC-002 literal JWT secret and no expiry/rotation/revocation | Observed | Open | Highest priority; Full policy/configuration spec before nonlocal exposure |
| SEC-003 fast unsalted password hash | Observed | Open | Highest priority; Full KDF/migration/password-policy spec using synthetic credentials |
| SEC-005 JWT stored in browser localStorage | Observed | Open | Decide storage/XSS posture; browser-faithful session tests required |
| SEC-006 no login/register abuse controls | Suspected | Investigating | Confirm exposure/threat model, then decide throttle/lockout/recovery scope |
| SEC-007 all-interface bind with development defaults | Observed | Open | Inspect runtime/network boundary before any service or deployment approval |

No residual security risk is accepted by this tracker.

## Quality and verification backlog

| Item | State | Next trigger / owner |
|---|---|---|
| Production build | Blocked | Host Node `os.userInfo()` repeatedly fails with `uv_os_get_passwd ... ENOMEM`; project owner reruns on a healthy host before release |
| Browser/E2E journeys | Deferred | Add only after approved browser acquisition/service boundary; required before browser-specific or release claims |
| Coverage baseline and ratchet | Deferred | Add all-owned-source line/branch/function/statement measurement before modernization target or release |
| CI gate and merge enforcement | Open | Add after local commands and secrets strategy are reviewed; verify actual remote enforcement |
| Four ESLint baseline allowances | Deferred debt | Separate quality slice; preserve the reviewed baseline and behavioral checks |
| Full protected-route and expired-token matrix | Deferred | Complete before release or security-readiness claim |
| Dependency vulnerability/reachability review | Unverified | Separate privacy/network-authorized advisory assessment |
| Service startup, shutdown, health, and persistence behavior | Unverified | Exercise only under an approved local runtime plan; current state is in-memory |

## Governance and delivery backlog

| Item | State | Next step |
|---|---|---|
| SPEC-ONBOARD-001 | In progress | Reconcile later executed checks/repairs, complete required review, and close only after verified integration |
| Fresh-session project skill discovery | Deferred | Recheck after a normal Codex restart; prior probe failed before initialization |
| Independent Full review | Pending | Review this master before using it to coordinate Full child execution |
| Release readiness | Unverified | Requires resolved security policy, successful build, agreed coverage/browser/CI gates, and explicit release authority |

## Suggested sequence

1. Full security-policy slice for `SEC-002` and `SEC-003`.
2. Quick spec for `FUNC-001`; stakeholder decision followed by a separate slice for `FUNC-004`.
3. Restore production-build verification on a healthy host.
4. Establish all-owned-source coverage reporting and ratchet.
5. Complete browser/protected-route verification, then add CI enforcement.
6. Resolve reviewed lint debt incrementally and perform onboarding/master closeout review.

## Reconciliation rules

Each future slice must update its canonical finding or review record first, then update this master row. Static suspicion is not reproduction; a passing focused check is not production readiness. Security acceptance requires explicit risk authority distinct from business intent. This master remains draft until independently reviewed and accepted as the project coordination plan.
