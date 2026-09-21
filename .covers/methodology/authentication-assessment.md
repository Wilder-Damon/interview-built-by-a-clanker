# Authentication-policy assessment

Use for authentication-bearing systems during initial assessment and relevant
security changes. This discovers policy questions; it does not prescribe a
universal password rule or grant repair, install or external-query authority.
Use scaffolding/authentication-review.md (under .covers/ after adoption).

Inspect actual frontend, shared contract, backend and provider behavior. Record
observed/source-confirmed/inferred/unexamined separately from stakeholder decisions.

- Password minimum/maximum; units (bytes/code points/code units), Unicode,
  whitespace, normalization, truncation and below/equal/above boundaries.
- Common/compromised-password screening, source and disclosure implications.
- Authentication defaults, public/protected routes, identity shape and per-user/
  tenant ownership; pair rejection with valid success and unchanged-state checks.
- Login/registration abuse controls, enumeration, recovery and MFA applicability.
- Hash storage/verification, salts, record/parameter validation, asynchronous and
  concurrency resource bounds, migration/reset policy.
- Token configuration, expiry/revocation/rotation, client storage, logout/reload/
  account switching and delayed in-flight responses after logout.
- Uniqueness and concurrency: check-then-await-then-write races and atomicity after
  replacing synchronous work with asynchronous operations.

Compare applicable current authoritative guidance with the actual threat model
and identity provider before recommending policy. Cite consulted version/date.
No real passwords, tokens, hashes or private account data may be sent to external
services. Documentation research, application traffic and advisory queries are
different: record approved destinations, purposes and payload classes separately.

Compatibility is not security acceptance. A retained weak policy gets a distinct
finding with evidence, impact, decision owner and revisit trigger. Approval of a
bounded hashing repair does not approve a weak minimum, unlimited attempts or
indefinite sessions for release. Revisit local-rehearsal exceptions before nonlocal
exposure or release. Never claim exhaustive discovery or security certification.

Present exact invariant text, parameters and compatibility implications at approval.
Preserve old candidates when splitting/superseding them; reconcile live registers.
Each authorized stage needs meaningful red evidence before its repair and faithful
post-fix tests. Verify behavior-preserving seams before changing exposed behavior.

Separately scope new findings, but assess whether they invalidate an accepted
invariant or completion claim. Out of scope is not the same as non-blocking.
Component tests do not establish browser session transitions.
