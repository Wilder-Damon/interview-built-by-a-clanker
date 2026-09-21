# COVERS Lite: working code first, accountable release later

SPEC-TOOL-019/R1-R6. Read the shared COVERS.md authority contract first. Lite and Full are task/feature workflows, not mutually exclusive project modes. One repository can use both concurrently. The distributed skills route both; shared project rules and existing gates still apply.

## Choose per task, revisit as scope changes

Recommend the lightest workflow that fits the task's risk, uncertainty, reversibility and coordination needs. Briefly state the recommendation and reason in the existing note/spec; no separate approval ceremony, global mode flag or new metadata schema is needed. Honor explicit user/team requirements. If risk is unclear, do bounded discovery before recommending; do not equate a small diff with low risk.

- Lite often fits a well-understood, reversible UI adjustment, focused test addition or isolated internal change with clear acceptance and limited impact.
- Full often fits authentication/authorization, data migrations, cross-service contracts, complex business rules or work requiring durable cross-team decisions and detailed evidence. A one-line permission change can deserve Full.
- A feature can have a Full core slice and independent Lite supporting tasks. Keep scope and shared interfaces clear; assess combined impact rather than splitting a risky change into nominally small tasks to evade controls.

Onboarding records shared constraints and any team defaults, not an exclusive workflow for the repository. A quick spec can be promoted to Full at any time, by choice as well as when uncertainty, impact or dependencies grow. No blanket conversion of other tasks is needed. Reassessing a Full task does not erase its permanent record or obligations.

## Promote a quick spec at any time

SPEC-TOOL-019/R7: promotion is available before implementation, during work or after a quick task has finished. It does not require a risk increase, release milestone or completed deferred work, and is distinct from release approval.

Carry the quick spec's intent, decisions, existing results, unresolved questions and owned deferrals into a formal spec using the existing Full format. Assign a stable spec ID, add proportionate acceptance, file scope, dependencies and applicable invariant references, and register it. Start in draft if details are incomplete; establish readiness before subsequent Full execution. Preserve actual historical evidence and its limits rather than rerunning work solely for ceremony or pretending earlier work had Full approval. Promotion alone never establishes completion; Full closure still requires verification and integration.

Retain the originating quick note by default with a pointer to the Full spec and a statement that the Full spec now owns current intent. Link back to the quick note from the Full spec's provenance/body, not as a nonexistent formal amends/depends_on ID. Avoid two competing live specifications. Any later removal follows the existing evidence-preservation and backlink-review policy; promotion never automatically deletes the original or discards unfinished obligations. This is a skill-guided/manual workflow, not a new CLI command.

Quick notes and formal specs coexist under specs/quick and the existing Full lifecycle folders. A quick note may reference a formal spec in prose; a formal depends_on requires a registered, evidenced prerequisite, not an unregistered note. Promote necessary prerequisite evidence deliberately instead of fabricating readiness.

Workflow selection is separate from drift policy. A mixed pull request still has to pass its actual repository gates: default enforced drift will report implementation paths covered only by quick notes as unmapped. Where formal mapping is required, split independent changes or add reviewed formal scope for the relevant paths. Do not switch an entire PR to report-only merely because one task used Lite, or claim automatic per-file policy routing that the CLI does not implement.

## The smallest useful loop

1. Inspect the relevant code, steering, known constraints and execution boundary. Confirm the requested outcome and authority; do not run unfamiliar code or real backends by assumption.
2. Write a quick spec at specs/quick/<short-name>.md using scaffolding/quick-spec.md (prefix .covers/ for the distributed template). Capture outcome, boundaries, verification and any deferred work. No master, YAML, registry, mandatory inline comments, per-test IDs or detailed file mappings are required. Read existing applicable specs/invariants; Lite cannot override them.
3. Implement a small slice, by human or agent. Characterize relevant valid behavior before risky edits; reproduce an agreed bug with a meaningful failing regression before repairing it. Run fast unit tests first, focused integration checks for real boundaries, and E2E for affected critical journeys. Keep current mandatory checks passing. No fixed pyramid percentages or forced E2E for a pure function.
4. Review the diff and evidence. Record actual commands/results, environment, unresolved drift and limitations in the note. A runnable demo is not proof of correctness or release readiness.
5. Reconcile intent and implementation, then either stop at locally verified working code or explicitly promote to the project's delivery workflow. Do not deploy, publish, weaken a gate or approve a business/security decision merely because Lite was selected.

## What can move later

Broader coverage-directed expansion toward the default 80% target, comprehensive baseline metrics, new strict lint/type rules, expanded documentation/wiki synthesis, detailed traceability and independent critique can be deferred when not needed for the change's risk. Each deferred item needs an accountable owner and a date or concrete revisit trigger, normally before release/promotion. Resolve required items or obtain an explicit authorized exception at that milestone; do not silently delete debt. Requested mutation testing remains optional in both profiles, not a mandatory graduation step.

Never defer applicable safety/security boundaries, known invariants, relevant correctness/regression checks, existing required gates, or approval for unresolved business behavior. Security-sensitive, destructive, data-migration or cross-team work may need Full immediately; choose proportionately with the team. Full is not a demand to run every optional tool.

## Human edits and visible drift

Spec-led work is recommended, not an authorship restriction. Both profiles allow direct human edits. If changes precede a spec update, expose and review that drift; reconcile the spec or implementation before the next affected slice. Never fabricate prior authorization or silently reinterpret an invariant to make a change fit. Agents still operate within actual user scope.

For visibility without a spec-mapping gate, explicitly select advisory reporting:

```sh
node .covers/tooling/cli.mjs drift --target . --base HEAD --policy report
```

Git needs an existing baseline commit; Node >=22 and the toolkit's pinned parser are needed only if using the optional CLI. A Markdown quick note and existing project tests need no COVERS runtime. A minimal Git project with no formal registry/catalog can report changes. Partial or corrupt formal metadata is an error, not an ignored setup. `validate`, `index` and `readiness` remain formal-artifact commands; do not run them as prerequisites for a plain quick note.

Report mode retains typed branch/index/worktree changes. Without selected formal specs, implementation paths are unmapped: the CLI cannot read a quick note's meaning. Optional `--spec ID[,ID]` uses formal readiness and exact scope. A snapshot mismatch stays visible and its affected changes stay unmapped. `outcome` is mapped, unmapped or incomplete; mapped means path accountability only. Exit 0 means a report was produced, NOT that the change is compliant or releasable. Unmapped paths are advisory; incomplete metadata, invalid selection/options or Git failure remain nonzero errors. Operational errors may be stderr rather than a JSON report.

The default `--policy enforce` is unchanged: selected formal scope is required for implementation changes and unmapped paths fail. `--mode index` and `--mode branch` select snapshots independently of policy. Existing hooks/CI/protected branches are not changed automatically. A team can explicitly configure a report-only drift check while keeping required tests and security controls enforced; surface the report to reviewers, not just its exit code.

## Urgent work, promotion and retention

Urgent production containment needs separate operational authority, a narrow change, relevant tests, rollback and a named reconciliation follow-up. A quick spec can capture that quickly. When prior documentation is genuinely impossible, record what actually happened afterward without claiming it was pre-approved. Lite itself grants no emergency permissions.

Keep quick notes by default. Before broader team handoff or release, reconcile deferred work and transfer durable requirements/decisions, accepted invariants and verification evidence into maintained project records (a Full spec where that is team policy). Add detailed mappings when useful. Formal Full specs retain the 1_active -> 2_completed -> history/domain lifecycle and permanent history.

A quick note may be deliberately deleted only under the team's retention policy after important decisions, evidence and outstanding obligations are preserved elsewhere. Review incoming links and update affected references; do not delete a note serving as an evidence record or compliance obligation. There is no automatic cleanup command. Quick notes are excluded from the formal spec registry, so do not use a quick-note ID as a formal dependency or claim it passed formal readiness.
