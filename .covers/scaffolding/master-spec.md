---
id: SPEC-000
description: Establish the project's modernization plan and evidence gates.
status: draft
domain: modernization
sdd_mode: spec-led
parent: null
depends_on: []
amends: []
requirements: []
invariants: []
key_decisions: []
acceptance: [] # SPEC-TOOL-015/R3: add {id, description} records before readiness.
files: []
---

# Modernization master — adapt before execution

## Adapted metadata example — SPEC-TOOL-032/R1-R2

The blank frontmatter above is a draft, not execution-ready. Replace it with
project-specific intent, criteria, decisions and complete file records. This
minimal example demonstrates valid metadata; obtain actual authorization and
independent Full review before execution. Do not copy its outcome as your own.

```yaml
id: SPEC-EXAMPLE-001
description: Preserve the documented result of the example command.
status: ready
domain: tooling
parent: null
depends_on: []
invariants: []
key_decisions: []
acceptance:
  - id: R1
    description: The command returns the documented result for the reviewed fixture.
files:
  - {path: src/example.js, action: modify, state: planned}
  - {path: tests/example.test.js, action: add, state: planned}
```

Use exactly `draft`, `ready`, `in_progress`, `blocked`, `complete`,
`verified_local` or `superseded` for status. Every file record needs `path`,
`action` (`add`, `modify`, `delete`, `rename`) and `state` (`planned`, `changed`,
`not_changed`); rename also needs an exact distinct `from` file.
`complete` means verified and integrated. `verified_local` means verified local
work with integration unavailable; it is not implementation or release authority.
Both terminal states live in `specs/2_completed` or retained domain history.

## Authority and baseline
Record user/team authorization, repository/revision, existing changes and execution/privacy constraints. Drafting is not implementation authority.

## Outcome, scope and non-goals
Define intended users and what modernization must achieve. Name owners and unresolved decisions.

## Requirements and invariants
Assign R1-style IDs with measurable acceptance; discover candidate invariants without preserving known bugs as requirements.

Use requirements frontmatter for source references (id, source, summary; optional revision). Sources may be email, Jira, Confluence, conversation, URLs or files. Briefly map each relevant source ID to local R1-style acceptance criteria and later test/review evidence. Capture only enough intent, scope and unresolved questions to guide this change; no separate business document is required. Record inaccessible, conflicting or unverified sources honestly. A link alone is not acceptance evidence.

## Child specs and sequence
Link onboarding, characterization, bug fixes and bounded modernization slices. Parent links coordinate; explicit dependencies constrain order.

Add a stakeholder checkpoint after scoped defect/candidate-invariant discovery and before affected business-behavior repairs. Use specs/reviews/<domain>-stakeholder-review.md from the stakeholder-review template. Record who can decide, which observations are confirmed bugs versus expected/unclear behavior, and approval/revision/rejection of exact invariant statements. Actual reviewer/role, date, reviewed version, rationale and evidence are required; agents cannot grant approval. Reconcile decisions into specs/invariants.json and governing specs without duplicating live authority. Separate acceptance, verification and execution permission; unresolved items block only their affected changes. Preserve independent technical work and explicitly authorized urgent containment.

Plan a final strict-engineering hardening slice after baseline capture, scoped defect repairs, behavioral protection and agreed coverage/workflow targets. Preserve existing meaningful checks throughout and repair existing compiler/check failures earlier under their own scope. Document any earlier urgent safety/prerequisite hardening; do not wait for an impossible all-bugs-eliminated guarantee.

Maintain a separate linked security-findings register for exposure, evidence, remediation and authorized residual-risk acceptance. Distinguish business decisions from developer feasibility and security-risk authority. In training, label every decision with exercise mode and acting role; practice decisions never auto-approve production invariants or satisfy independent-review requirements. Use the stakeholder-review and security-findings templates; record a fresh explicit operational decision before promoting an exercise conclusion.

## Quality and verification gates
Define honest coverage scope/targets, critical E2E journeys, security, type/lint/build checks, and relevant operational/AI evaluation requirements. Record exemptions with rationale and owner. Link tests or manual review for each requirement.

For every language/component, decide applicable lint/static analysis, compiler/type diagnostics and framework rules; record non-applicability with rationale. Do not mandate TypeScript, one linter or a typing migration for dynamic code. Select strict rules and pinned compatible tools under the hardening spec, separate formatting churn, review autofixes and verify small changes behind tests. Require zero unapproved warnings/violations in the agreed gate; narrow exceptions need owner, reason, evidence and expiry/revisit date. Broad suppressions, unsafe type escape hatches and source exclusions are not substitutes for fixes. Record actual test/type/build/static results and independently repeated CI checks when authorized; optional hooks are not enforcement. Runtime validation and behavioral tests remain necessary.

## Recovery and evidence
Define rollback/migration needs, commands/results, known failures, unresolved findings and completion criteria. Keep active through verification AND integration. Close in a metadata-only follow-up. Record verification: {revision: <tested identity/local state>, outcome: passed, evidence: [<existing repository-relative receipt>]} only from actual results. Completion readiness checks references, not evidence truth.

For an explicitly source-control-free project, the alternative is
`readiness --spec SPEC-ID --phase local` with actual criteria, required review and
passed evidence plus `verification.scope: local` and
`verification.integration: unavailable`. Only after that verification and review,
move to `specs/2_completed` with `status: verified_local`. The guard must positively
check the target and all ancestors: Git markers, bare layouts, inherited `GIT_*`
overrides, redirected paths and inspection errors prevent local closure. Do not
clear overrides or initialize Git to pass it. Metadata checks do not perform tests
or establish substantive acceptance/review. Archive preserves status and evidence;
after Git adoption, use a new integration/amendment record without rewriting local
history. Local prerequisites can support no-Git execution/local closure, never Git
drift or integrated completion. See `methodology/formats.md` for the full contract.
