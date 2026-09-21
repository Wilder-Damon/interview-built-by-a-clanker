# Independent critique (workflow)

SPEC-TOOL-015/R2: preserved workflow guidance, extracted from the former full operating contract. Read the short COVERS.md contract first; higher-priority authority is unchanged. Paths in this reference are repository-root paths in the source distribution; prefix .covers/ after adoption unless already specified.

## Independent critique (workflow)

Full requires independent spec review before implementation and review of code,
tests and authored documentation before closeout. Re-review materially changed
scope/acceptance before affected execution. A non-author human or authorized
independent subagent can review; an author's second pass is not independent.
Use raw artifacts and actual boundaries, not a desired answer. Read-only means
no intentional source edits, not that tests have no side effects: inspect commands
and retain execution/network/resource authority. If delegation is unavailable or
unauthorized, retain the gap and seek an authorized exception or leave the
checkpoint pending. Lite may defer optional critique with owner and revisit
trigger. An explicitly requested review remains pending until performed or its
deferral is authorized by the requester; merely recording a deferral is insufficient.

Rate specs on intent/scope, feasibility/dependencies, testable acceptance,
risk/invariants/recovery, and readiness/traceability. Each gets 0 absent, 1 partial,
2 sufficient; total is max(1,sum)/10. Readiness/blockers are separate, not a
correctness probability. Retain reviewer, artifact revision/snapshot, scope and
actual evidence. CLI metadata checks do not establish independence or prove review.

SPEC-TOOL-030/R5: forward-review the actual boundary evidence: nested manager
identity and unchanged persistent PATH; an unimported function/conditional fixture
with raw per-metric denominators (0/0 is not 100% evidence); and owned process,
listener and state cleanup after the advertised stop. Review interpretation from
raw artifacts independently, not by matching words in guidance. For parallel work,
check the single coordinator's stable metadata snapshot, reviewed reindex and
checked native gate exits before implementation; review-induced metadata changes
must return through that checkpoint (workflows/specification.md).

Findings need stable IDs, evidence, severity, consequence, correction and closure checks. Fix within authority and spec scope, or record disputed/deferred/blocked with reasons. Re-review corrections independently; don't loop to manufacture a 10. Unresolved required findings prevent completion.

SPEC-TOOL-032/R6: use developer-handoff.md to challenge exact requirement-to-
observation mappings, fresh-terminal commands and actual manual-preview egress.
Do not accept a test-only network mock as a demo boundary or a lockfile as proof
of installed identity. Distinguish wrapper exits from owned process cleanup.

At closeout reconcile live AGENTS.md commands/stop points, finding dispositions,
exact invariant decisions, requirement-to-acceptance mappings and receipt claims.
Preserve completed specs and failed attempts. A late review cannot rewrite its
historical timing. Assess new out-of-scope defects against current acceptance;
separate registration does not make them non-blocking. User-reported manual checks
are not automated E2E evidence.
