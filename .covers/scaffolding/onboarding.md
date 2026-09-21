# Onboarding record

Record repository/revision, relevant local changes, reviewer/date and execution boundary.

## Architecture and behavior
Identify existing requirement sources (email, Jira, Confluence, conversation or files) and link relevant ones from the master spec's requirements field. Capture a short outcome/scope summary and material open questions; reuse existing records rather than requiring a new business document.

Map components, entrypoints, data flow and critical user journeys. Separate source findings from reproduced defects.

## Steering inventory
List root/nested AGENTS.md, other AI instructions, discovery scope, agent compatibility, owners, conflicts and decisions.

## Existing-spec disposition
Inventory current spec directories/tools, owners where known, status evidence, IDs/links and overlapping scopes. Record retain/coexist, integrate/bridge or separately authorized migration with rationale, governing source per scope and unresolved conflicts. Preserve original records; do not infer completion or code coverage from file names/checklists. Note which records the COVERS registry actually indexes.

## Root steering outcome
Record whether root AGENTS.md was created or existing guidance merged, after checking case variants, overrides and scoped instructions. Link the actual file, record review ownership and verify local references. The supplied template is a proposal only; successful init is not proof of project-specific steering or active skill discovery. If only planning was authorized, record the proposed change as pending.

## Skills and tools
For each skill/tool: source, pinned version/revision, installation scope, scripts/hooks, network/credential needs, validation command and outcome. Distinguish required/optional/not applicable and declared/installed/configured/runnable/verified/enforced. Never store secret values.

## Reproducible execution environment
Recommend Docker or an approved equivalent (for example Podman or a disposable VM) for consistent debugging, builds and tests; reuse team tooling rather than adding a mandatory COVERS dependency. Link the covering spec and versioned environment definition. Record:

- Choice and rationale: container, VM or approved local environment; code risk, permitted actions and any exceptions.
- Reproduction inputs: actual image identity/digest, runtime/package-manager versions, lockfiles, OS/architecture, configuration names without secrets, fixtures, build/test/debug commands, CI parity and known host differences.
- Prerequisites and readiness: installed CLI versus usable engine/backend, virtualization if applicable, observed versions/health/smoke checks, user-owned admin/terms/restart steps and missing prerequisites.
- Boundary: non-root/privilege settings, resource limits, exact mounts and disposable output paths, credential exclusion, inbound ports and outbound policy for both application and browser/test processes. Do not mount the engine socket or personal home directory into unfamiliar-code runs.
- Acquisition versus execution: authorized package/image sources, inspected lifecycle/build hooks, and how required offline execution is enforced after provisioning. A container alone does not block networking. With --network none, browser and services must run together inside its loopback namespace; a host preview is not available.
- Verification evidence: actual commands/outcomes confirming effective restrictions before unfamiliar code runs; use harmless checks, not real production backends. Browser mocks and localhost binding alone are not egress controls. If isolation is unavailable, stay static-only and name the blocker.
- Reset/cleanup: project-owned containers, volumes and fixtures, retained evidence, safe repeat-run steps and owner; no broad engine-wide prune.

Reproducibility is not proof of security or exact production equivalence. Higher-risk code may require a stronger sandbox; document the residual risks. Do not claim this template provisions or verifies any environment.

## Baseline

SPEC-TOOL-010/R1-R5 template amendment: use the distributed initial-assessment.md worksheet and methodology reference to choose a bounded, risk-adapted scan. Record applicability and gaps across values, state/cache contracts, identity, concurrency, real transport, recovery, dependencies and engineering controls. Keep source/tool/config identities and actual receipts for repeat runs. Document project tuning and revisit triggers; no mandatory new analyzer or promise that all defects are discovered. Map authored code, tests and documentation to the governing project spec, with generated artifacts covered through provenance/file mappings.
Capture actual unit/integration/E2E, coverage, lint/type/build and security outcomes with limitations. Identify valid behavior for characterization and known bugs needing red/green tests.

### Code metrics: record before repairs, compare afterward

Inventory appropriate measures for each language/component before repair/refactor work. Reuse available approved tooling; do not install or upload code automatically. Mark missing/inapplicable measures explicitly. Use a retained baseline report and a separate current report at relevant slice closeout/final hardening; never overwrite earlier results.

| Measure (adapt per component) | Definition / scope / tool | Collection status and evidence | Baseline | Current / delta | Hotspots / interpretation |
|---|---|---|---|---|---|
| Cyclomatic complexity | <analyzer definition; function/method population> | Not collected | Not measured | Not measured | <count, median/p95 where meaningful, maximum, named hotspots> |
| Cognitive complexity, if supported | <tool-specific definition> | Not collected | Not measured | Not measured | <distribution and context; or not applicable with reason> |
| Function/module size and source LOC | <units and owned-source scope> | Not collected | Not measured | Not measured | <large components and denominator changes> |
| Duplication | <detector definition/config; duplicated and eligible lines/tokens> | Not collected | Not measured | Not measured | <raw counts, ratio and locations> |
| Dependency coupling/cycles, if meaningful | <graph scope, internal/external edges and definition> | Not collected | Not measured | Not measured | <cycle/coupling hotspots and limitations> |

Adapt rows to actual project needs; no fixed language, framework, UI or architecture assumed. Keep coverage and static diagnostic counts as separate baseline measures. No finding is a confirmed bug merely because a metric is high.

For each report retain revision/local patch snapshot, tool/version/config, command/environment/date, raw report path, metric granularity/units, included/eligible file counts and justified generated/vendor exclusions. Unsupported measures are unavailable/not applicable, not zero. Blocked collection stays pending with the missing prerequisite and retained baseline revision.

Compare like-for-like tool/config/definitions/scope. Show absolute baseline/current/delta and raw denominators; keep mixed-language results separate. Identify changed, added, removed and renamed components, and distinguish matched-source improvements from population changes. If tools/exclusions change, remeasure the retained baseline within authority or label non-comparable; preserve historical evidence. Propose thresholds/no-regression budgets only after context review under a spec. Additional strict gates follow the agreed hardening stage; existing meaningful checks stay active. Refactoring needs its own scope/authority and behavioral tests, not just a hotspot score.

## Planned strict-engineering hardening

Record a quality ratchet per rule/component: observe/report-only -> reviewed baseline -> prevent new violations -> improve touched code -> full agreed enforcement. Include owner, exact rule/tool/config, scope, baseline receipt, stage, thresholds, promotion trigger and exceptions with expiry. Distinguish observational warnings from enforced failures; missing/incomparable reports never count as a pass. Keep legacy debt visible, preserve existing gates and do not reset baselines/exclusions automatically. Reuse stack-native analyzers and a non-mutating local command; IDE extensions/hooks are conveniences, not enforcement. CI/merge protection need authorized configuration and actual failure evidence.
Inventory existing effective lint/static analysis, compiler/type checks and framework rules for each language/component, including owned/generated/third-party boundaries. Mark applicability and gaps with rationale; do not assume every stack supports TypeScript-style checks or needs a typing migration. Preserve existing checks and baseline failures. Plan additional strictness after characterization, scoped fixes and agreed test/coverage targets; repair existing failures earlier and document urgent safety/prerequisite exceptions to ordering. Link a future covering spec with compatible tool pins, selected rule rationale, zero-unapproved-warning/violation gates, narrow owned exceptions with revisit dates, and test/build verification after small reviewed changes. Keep formatting churn separate. CI/hook configuration remains separately authorized; no automated installation is implied.

## Stakeholder review readiness

Standard checkpoint: after bounded discovery and baseline/characterization evidence, present all known in-scope findings together before selecting behavior-changing repair specs. Link one consolidated review packet, plus domain batches if needed at scale. Use stakeholder-review.md as the decision worksheet; if a wiki is adopted, create a source-backed findings overview as its business-review entry point. No mandatory wiki/tool installation. Include stable IDs, impact, evidence confidence, proposed next action, pending/actual disposition and priority/owner. Show candidate rule snapshots in the same packet; keep quality gaps separate from defects and security detail in its access-appropriate register.

Collect explicit per-ID or enumerated batch selections (fix/investigate/defer/not-a-defect) with exceptions, role/authority, mode, rationale, owner, priority and revisit trigger. Review all items in scope rather than asking one item per interaction; do not assume blanket approval. Hypotheses remain unconfirmed until evidence supports them. Reconcile decisions into canonical records before repair specs/execution and refresh derived pages afterward. Record additions in later batches; do not require exhaustive discovery to begin.
Identify accountable business/domain/security/technical owners and the authorized source of approval evidence. Link a bounded stakeholder-review record for discovered defects and candidate invariants, using the distributed template. Keep evidence confidence, stakeholder disposition, invariant acceptance and verification states separate. Record pending owners/questions honestly; do not accept candidates automatically. Reconcile approved versioned decisions into catalogs/specs before affected behavior changes, and define re-review triggers for changed meaning. A document prepared for review is not approval or permission to execute. Unambiguous technical work can proceed under its own spec while business decisions are pending.

Choose exercise or operational review mode and record roles/authority. One person may play business and developer separately in an exercise; practice decisions are not production approvals. Link a separate security-findings register with an authorized risk owner, exposure/evidence, remediation and time-bounded residual-risk decisions. Avoid duplicated live status and restrict sensitive evidence appropriately; file separation alone is not access control.

## Handoff

Optional knowledge layer: record existing wiki disposition, intended audience, approved source scope, governing setup spec and maintenance owner. Seed only useful source-backed pages; enrich after baseline and review affected pages at spec closeout. Link wiki/index.md and actual knowledge-check results if adopted. Treat source freshness, semantic confidence and stakeholder approval separately. No mandatory Obsidian, embeddings, MCP or source ingestion.

Link master/child specs and candidate invariants. Decide ready-for-slice, restricted, or blocked with a named missing prerequisite. Assign maintainers and revisit triggers.
