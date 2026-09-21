# Initial assessment: repeatable checkpoints, adaptable depth

Governing spec: SPEC-TOOL-010/R1-R5. Read with the shared COVERS operating contract. This reference applies to onboarding and major reassessments, not every small edit. No new tool or execution permission is implied.

## 1. Freeze the question and inputs

Record the project revision plus relevant uncommitted/untracked snapshot, requested outcome, authoritative requirements, languages/components, consumers, trust boundaries, data sensitivity and external effects. Inventory existing specs, steering, tests, build/type/lint/security/coverage/metrics checks and recovery procedures. Check actual discovered tests and enforcement, not merely configuration names. Preserve historical evidence.

Choose a profile in the onboarding spec: component/domain scope; critical journeys; supported environments; static-only or authorized runtime depth; tools already available; time/resource budget; exclusions with rationale/owner/revisit trigger. Reuse existing team controls. A library need not install a browser, a trusted project need not adopt a container, and an offline review must not call real backends.

### Discover the current architecture — SPEC-TOOL-022/R1-R3

For the first executable slice, follow the staged unit-first baseline in workflows/testing.md and adapt scaffolding/baseline.md. This matrix is an inventory of risks, not a requirement to build every test layer during onboarding. Record unexamined areas and owned revisit triggers; preserve existing mandatory checks and expand scope when the selected behavior requires a higher layer.

Produce a bounded architecture discovery before repair planning. Record system context and actors; components/packages/services and responsibilities; principal data and control flows; persistence and state lifetime; integrations; authentication, authorization and trust boundaries; runtime and deployment topology; build/test/observability paths; ownership; and sampled, blocked or unknown areas. Tie material claims to inspected paths, retained commands/runtime receipts or approved records and label them **observed**, **source-confirmed**, **inferred**, **claimed-only** or **unknown**.

Keep the discovered **current architecture** distinct from **target architecture** and recommendations. A diagram is optional and needs a searchable text equivalent. Use `scaffolding/wiki/architecture.md` as a standalone Markdown page or adapt it to `wiki/pages/architecture.md` with registered source revisions when a project wiki exists. Do not require a wiki or diagramming tool, install the template as evidence, expose credentials, or manufacture certainty from repository structure alone.

## 2. Build the assessment matrix

Start from the mechanisms below, then add domain-specific risks. For each applicable mechanism, record the contract or open question, touched components, proposed observation/test layer, evidence state, actual outcome and finding IDs. Mark not applicable with reasons; unexamined and blocked are not passes. A few bounded high-value cases can begin a review; do not promise exhaustive discovery.

| Mechanism | What to inspect and exercise where applicable |
|---|---|
| Values and boundaries | Units/scales across storage, API, computation and display; inclusive/exclusive bounds; zero/empty/missing/null distinctions; malformed/nonfinite input; combinations, ordering and rounding. Derive expected values independently of the implementation under test. |
| State and cache contracts | Cold start and warm transitions; every effective input in cache identity; consistent response shape across consumers; invalidation; clear/back/forward/reload; account/tenant switch; persisted versus in-memory state; stale in-flight responses. Equivalent principles apply to CLI caches and worker state. |
| Identity and authorization | Missing, invalid, expired and structurally wrong identities; runtime configuration defaults; all protected entry points; credential storage/verification; logout/reload; restart and identity reuse; cross-account reads/writes/deletes; legitimate owner success. A request blocked before authorization does not prove ownership enforcement. |
| Concurrency and lifecycle | Duplicate requests, uniqueness checks separated by awaits, retries/idempotency, transaction boundaries, startup/shutdown/restart, persistence assumptions and resource bounds. Separate existing defects from hazards introduced by a proposed repair. |
| Transport and integration | Real caller serialization, methods, headers, content types, empty bodies, CORS when relevant, response shape/status, actual middleware/composition and generated clients. An inject client or mock can bypass the failing boundary; add the lowest faithful integration or E2E check. |
| Failure and recovery | Expected errors, unavailable dependencies, partial failures, cancellation/timeouts, stale work, cleanup and rollback. Confirm observable errors and preserved state, not just lack of an exception. Use synthetic fixtures and fault injection within authority. |
| Dependencies and execution | Exact versions for the direct and transitive locked graph, install hooks, runtime/dev exposure, supported platforms and advisory freshness. Classify public/private packages and obtain authorization before external disclosure. Record query errors and compare version matches with actual reachability/containment. Reconcile provider lag against maintainer evidence; a match is not automatically exploitable and no match is not security clearance. |
| Engineering and operations | Architecture/coupling, test discovery/quality, supported coverage metrics including unimported code, diagnostic/build failures, structural metrics, CI gate effectiveness and recoverability. AI-enabled features also need task-specific evaluations, model/prompt versions and nondeterministic failure analysis. |

Use diverse candidate generation (including verbalized sampling if useful) to expose distinct failure mechanisms, then deduplicate and choose by risk. Model typicality estimates are not defect probabilities. Keep resulting tests deterministic. Stateful journeys should include transitions and adversarial identities, not only fresh-page happy paths.

## 3. Establish evidence before repair

For systems with authentication, read authentication-assessment.md and use
scaffolding/authentication-review.md. Inspect policy as well as mechanisms:
retained weak policies remain findings even when compatibility preserves them
during another repair. Record exact approvals and residual-risk owners.

Characterize important valid behavior. Record suspected incorrect behavior separately; stakeholder agreement determines intended outcomes, not whether a failure was reproduced. Write regression assertions against the approved contract and retain an actual failing baseline before repair. Import/setup/fixture failures are not product red evidence. An advisory/version match can justify a dependency patch without attempting an exploit.

SPEC-TOOL-030/R5: for executable assessment, retain parent/nested package-manager
identities and read-only PATH preservation evidence using workflows/environments.md.
Use workflows/testing.md's unimported function/conditional challenge: record each
metric's covered/total counts; a 0/0 population may be unknown even when lines are
measured and the reporter displays 100%. Verify advertised shutdown with owned
process exits, released listeners and cleared/absent state. Coordinate metadata
through workflows/specification.md's one-writer checkpoint and checked native
exits before repair. Put detailed observations in the project assessment receipt;
these references add no language, package manager or runtime adapter requirement.

### Privacy-aware dependency advisory review — SPEC-TOOL-020/R1

When applicable, derive the exact version inventory for direct and transitive dependencies from the locked graph with an ecosystem-maintained package manager or parser. Classify public, private/internal and unknown package identities before any external request. Record the provider or local database, the exact proposed metadata payload, its privacy implications and actual authorization. Do not disclose source, a lockfile, private package names or URLs, credentials, repository identity or organization metadata without specific authority. An offline database, organization-hosted mirror or approved internal scanner is an equivalent path; OSV is one optional public provider, not a COVERS dependency.

Retain query date/provider, package-version count, query errors, affected records and distinct advisory IDs. Review authoritative records for affected ranges, withdrawn status, prerequisites, platform, runtime/build/development role, reachability and current containment. A match is not automatically exploitable, and no match is not security clearance. Keep detailed evidence access-appropriate and share a sanitized summary.

Do not silently upgrade dependencies during assessment. Dependency remediation needs a separate covering spec, the smallest compatible reviewed change, a locked-graph diff, install/build-script review and relevant unit, integration, E2E and security checks. Reassess after dependency, platform, input-trust, network or deployment changes.

Use real composition at relevant boundaries. Pair rejection checks with valid success and unchanged-state assertions. If an earlier failure masks a later one, retain both runs and amend the spec before any additional necessary repair. Unrelated discoveries enter the findings register for review; neither a failing test nor a checklist authorizes expanding scope.

## 4. Review and deliver a bounded assessment

### Diagnostic tests and policy questions — SPEC-TOOL-011/R2

Pair inverse actions where meaningful: add/remove, grant/revoke, enable/disable, reserve/release. Check persisted or API-observed state, not only a successful toast. Exercise shared data through different consumers in both cold and warm sequences; a passing direct load can conceal navigation failures. Distinguish absent, null, empty and wrong-type input where the boundary accepts untrusted data. Where feasible, verify accessible control names instead of relying on icon shape alone; inaccessible controls are findings, not a reason to abandon behavior tests.

Separate independently justified proposed-behavior probes from passing preservation tests. Pending policy questions—such as consumption, replay, persistence or recovery semantics—may need observations rather than assertions blessing current behavior. Record intended semantics and actual approval before a repair. A failing diagnostic assertion supports reproduction, not automatic business acceptance.

Retain diagnostic failures without skips, retries that mask them, weakened expectations or silent removal. If running a selected preservation suite, disclose the excluded probes and full-suite status. Check actual discovered/executed counts and case identities against the intended plan; package-manager argument forwarding or a runner filter can select the wrong tests. A command label and exit code alone do not prove the requested suite ran. Zero tests is not a pass. Preserve failed harness attempts separately and rerun after a scoped harness correction; do not confuse fixture failures with product defects.

Consolidate all known in-scope findings and candidate invariants for stakeholder review. Keep one canonical status per finding, with evidence confidence separate from disposition, severity and verification. Keep sensitive security detail appropriately restricted. Separate reproduced defect, source-supported concern, hypothesis, advisory match, quality gap and future design hazard.

Handoff includes the discovered architecture, assessed/unassessed/blocked scope, source/tool/config identities, actual commands/exits and raw evidence, findings/decisions, coverage and metric limitations, recovery constraints and the next bounded spec. Repeat from these retained inputs after relevant changes; add new cases from evidence. Predictability means consistent checkpoints, decision rules and observable outcomes—not identical model output or a guarantee of no defects.

## Traceability through every deliverable

Before edits, map requirement IDs to explicit files or narrowly bounded directories in spec frontmatter. Use stable spec IDs independent of lifecycle paths. Meaningful production enforcement points reference spec/requirement and applicable invariant IDs; tests name the contract they check; authored documentation names the governing spec and sources; receipts include spec, source identity, commands and results. Existing docs use a focused amendment reference without erasing prior provenance.

For JSON, lockfiles, generated source, binaries and third-party assets, use an authoritative spec file mapping plus generation/provenance manifest where useful. Do not add invalid comments or modify generated output only for a tag. A file tag alone does not prove every claim or branch is correct. For large changes, provide a small requirement → implementation → test/document → evidence table.

Before handoff, verify every changed artifact is mapped, references resolve, tests assert intended behavior, documentation agrees with actual results, and generated outputs correspond to inputs. Review changes to tests/specs/gates themselves. CLI drift/path checks and hashes detect missing accountability or changed bytes, not semantic compliance; use behavioral checks and independent review. Preserve prior spec decisions and link amendments rather than rewriting history.

## Tuning without removing safeguards

Tune scope, depth, tools, thresholds, environments, domain-specific checks and review cadence in the project spec. Record what was skipped and when to revisit it. Never tune away authorization, safe execution boundaries, honest evidence, required accepted invariants, existing enforced gates or traceability. Missing evidence remains missing; a constrained assessment is useful when its limits are explicit.
