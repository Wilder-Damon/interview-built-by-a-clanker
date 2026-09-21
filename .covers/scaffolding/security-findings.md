# Security findings — <domain or bounded change>

Copy to specs/reviews/<domain>-security-findings.md. This is a finding register, not an executable spec or proof the system is secure. Use stable IDs and link the stakeholder review, product defects, invariants and remediation specs. Each finding has one authoritative live status; other documents reference that ID rather than maintaining copies.

## Register context

- Mode: exercise / operational (select explicitly).
- Scope, exclusions and system revision/local changes: <exact reviewed artifacts>.
- Related stakeholder review and governing specs: <IDs/paths>.
- Actual technical owner and authorized security/risk owner: <names, roles, authority; unknown stays pending>.
- Evidence storage and permitted audience: <approved access-controlled location>.
- Prepared by/date: <preparation is not approval>.

Do not store credentials, personal data or sensitive exploit details in a broadly shared repository. Use a sanitized summary and access-controlled evidence links. A separate Markdown document is not an access boundary. Do not contact third parties, test a live system or disclose vulnerabilities without authority.

For dependency advisory evidence, inventory exact versions across the direct and transitive locked graph and classify public, private/internal and unknown packages before querying. Record the destination, exact metadata payload, privacy risk and actual authorization for any external disclosure. Never send source, lockfiles, private package names/URLs, credentials or repository identity without specific authority; an offline/local source is valid. Preserve provider/date/counts/query errors and assess authoritative ranges, withdrawn status, prerequisites, role, platform, reachability and containment. A match is not automatically exploitable; no match is not security clearance. Dependency changes require a separate covering spec and verified locked-graph diff.

## Findings index

| Finding ID | Summary / component | Evidence state | Severity / exposure | Canonical status reference | Related defect / invariant / spec IDs | Owner |
|---|---|---|---|---|---|---|
| <SEC-001> | <sanitized facts> | hypothesis / source-supported / reproduced | <reasoned assessment; unknown explicit> | <link to finding detail; do not duplicate status> | <links> | pending |

## Finding detail — <stable ID>

- Observed condition and affected revision/component: <facts, not assumed exploitation>.
- Evidence/confidence and authorized reproduction: <source/isolated test reference; limitations>. Unverified is not reproduced; a scan warning is not automatically a confirmed vulnerability.
- Exposure/preconditions and impact: <who can reach it, data/actions affected, current safeguards, unknowns>.
- Severity and rationale: <project scale and context; do not invent a numeric score>.
- Related product defect/invariant: <IDs; security status lives here>.
- Proposed containment/remediation and covering spec: <scope, owner, target date; no automatic execution permission>.
- Verification plan/results: <negative/security regression plus relevant valid behavior, tested revision, actual outcome and evidence reference>.
- Current remediation status (canonical; index links here): open / investigating / remediated-awaiting-verification / verified-closed / dismissed-with-evidence.
- Residual-risk disposition: pending / mitigate / avoid / accept-with-expiry. Deferral is not verified closure; record rationale, owner, controls, due date and revisit trigger.

## Decision log (append, do not erase prior decisions)

For every decision record mode (exercise/operational), acting role, actual name/authority, date, finding ID and exact reviewed version, decision/rationale, residual risk, compensating controls, expiry/review trigger, and durable evidence reference. Unknown authority or missing evidence leaves acceptance pending. Revocation/expiry or materially changed exposure triggers reassessment; preserve superseded decisions.

Retain retrievable immutable reviewed content, including exposure, preconditions, residual risk and controls: a commit/blob, preserved diff against an identified base with untracked snapshots, access-appropriate snapshot/excerpt, or durable document version. Hashes verify retained content but cannot reconstruct it. Later reviewers must be able to recover the original acceptance scope after this register changes.

No decisions recorded. Business approval that behavior is intentional does not accept its security risk. Developer agreement to implement a fix is not risk acceptance either. Only the appropriately authorized risk owner can accept scoped residual risk; accepting risk does not silently relax an invariant or mark failed tests passing. Resolve conflicting obligations explicitly under a spec and appropriate approval.

In exercises one person can play separately labeled business and developer roles, and discuss the risk-owner perspective, but must not claim authority they do not hold. Practice decisions are not production approval, do not promote live candidate invariants and do not replace independent review where required. A fresh explicit operational decision against the relevant version is needed for actual acceptance. All execution/commit/deployment authority remains separate.

## Follow-up

- [ ] Every open item has an owner or explicit ownership blocker and next action.
- [ ] Risk acceptances are authorized, scoped, evidenced and time-bounded; exercise decisions remain practice.
- [ ] Verification is separate from acceptance: closed findings have actual relevant evidence; deferred/accepted risk is not reported as fixed.
- [ ] Related specs/invariants and stakeholder review reference the canonical finding without duplicate live status.
- [ ] Changed conditions and expired decisions trigger reassessment; retain history.

COVERS metadata validation does not verify identity, security completeness, risk acceptance or exploitability. Human review and meaningful technical verification remain necessary.
