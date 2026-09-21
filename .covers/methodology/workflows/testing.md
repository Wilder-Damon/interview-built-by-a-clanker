# Testing and legacy modernization

SPEC-TOOL-015/R2: preserved workflow guidance, extracted from the former full operating contract. Read the short COVERS.md contract first; higher-priority authority is unchanged. Paths in this reference are repository-root paths in the source distribution; prefix .covers/ after adoption unless already specified.

## Testing and legacy modernization

SPEC-TOOL-019/R1-R4: both profiles use the testing pyramid and relevant regression protection. Lite can defer broader coverage expansion, assessment inventory and detailed mappings with an owner/revisit trigger; it does not defer existing gates, applicable invariants or relevant safety/correctness checks. Formal traceability guidance below applies to Full. Read workflows/lite.md before using a quick note.

### Stage the first baseline

Recommend **unit-first** for the first bounded baseline of a simple project, including a live demonstration. Record this independently of Lite/Full; Full does not mean every test layer must be created now. Use scaffolding/baseline.md for the selected scope. An explicit expanded request, existing mandatory checks, or the risk of the selected behavior may require more.

1. Inspect existing commands and install only the authorized tooling needed for this stage. Capture existing build/type/lint/test outcomes before changing their configuration. Setup failures are quality gaps, not application regressions.
2. Establish fast deterministic unit characterization of meaningful valid behavior and boundary cases. Separate observations of suspected bugs from approved contracts; do not bless an apparent bug with a preservation assertion. Record actual selections, exits, timing, and coverage scope if measured. The broader 80% modernization target is not an initial onboarding gate.
3. Add focused integration checks only where needed to faithfully exercise a selected boundary. Do not mock away authorization, persistence, or real composition just to label a check unit. Unexamined boundaries remain explicit gaps.
4. Present known findings and candidate invariants together for stakeholder decisions. For a demonstration, select a bounded issue whose behavior can be verified at the available layer; record approval and a repair spec/quick note, show the meaningful regression fail before repair, then pass with relevant preservation checks. Do not preselect business decisions or force every finding into the meeting.

In a live debugging assessment, make investigation visible: explain the component map, follow a symptom across callers and shared contracts, form a testable hypothesis, and show the smallest useful reproduction. Unit-first is a feedback strategy, not a reason to ignore frontend or cross-package defects. Existing component tests or a bounded integration check may be the appropriate next layer. Report what the fix proves and what remains unverified; do not claim that a preselected demonstration establishes comprehensive codebase quality.

New E2E tooling, browser downloads, service orchestration and browser suites are **deferred by default** in a unit-first baseline, including for a web application. Do not install a browser runner alongside the unit runner merely because a later phase may need it. Preserve existing valuable tests and required gates; deferral does not authorize disabling them or weakening CI.

Record each deferred layer/journey with reason, accountable owner and concrete revisit trigger in the existing baseline record. If an owner is unknown, say unassigned and request assignment before progressing through that trigger. Revisit before verification of a repair that requires that layer, or before relevant release approval, whichever comes first. Browser-only behavior cannot be declared fixed from unit evidence; expand the authorized scope or leave the repair unverified/deferred. Before later E2E execution, inspect runtime destinations, approve required acquisition, and verify bounded server cleanup; do not launch it automatically when unit tests finish.

Onboarding completion means setup/discovery obligations are met. A scoped baseline can complete with explicitly deferred E2E and honest limitations. Repair verification is evidence for the selected behavior, not production approval. Release readiness still requires the agreed critical journeys and existing project gates. Do not silently remove an active spec's required E2E acceptance; revise scope with authority and retain its deferral, or use a subsequent spec when the original is completed.

### Default local coverage reporting

Recommend coverage reporting with the **first executable test baseline**, not
as a prerequisite for static onboarding. Reuse compatible existing project-native
tooling. If absent, propose the smallest compatible project-local reporter with
the unit-tooling installation approval, including dependency/lockfile changes and
network/lifecycle boundaries. This default is not permission to install packages,
add CI/uploads, download browsers or replace the project's runner.

Provide a repeatable coverage command separate from fast uninstrumented unit
execution, a readable console summary, a local HTML report and machine-readable
counts where supported. Document unavailable formats or metrics rather than
inventing support. Keep reports local by default and record their paths, command,
runtime/tool versions, test selection and measured source identity.

Define the denominator from owned source roots, including unimported modules.
Inventory the expected source files and reconcile them with the report; verify
that a known unexecuted executable file is present at zero coverage (or challenge
the reporter in an authorized disposable fixture). Exclude dependencies, tests,
build output and generated code with explicit reasons; document unsupported or
non-executable files. A loaded-module-only report is partial evidence, never an
all-owned-source baseline. Preserve earlier reports with their limitations.

Report raw covered/total counts and percentages for each supported line, branch,
function and statement metric, with package/component breakdowns. Do not average
percentages or improve scores by shrinking scope. Validate source-map paths and
avoid counting source and compiled output twice. Configuration alone does not
prove that unimported files were included.

SPEC-TOOL-030/R5b: inspect denominators separately for every metric. Inclusion at
zero line coverage does not establish a function or branch population. Some
reporters emit 0 covered / 0 total and display 100% for unimported files. For code
known to contain functions/branches this population is **unknown/unmeasured**, not
fully covered; retain the raw 0/0 and exclude it from claims of target attainment.
Use **not applicable** only when source inspection establishes no executable
population for that metric. Do not invent replacement totals or average away gaps.

Concrete challenge: in an authorized disposable source root, create a module that
exports a function containing a conditional, leave it unimported, then run the
reviewed all-source coverage command. Retain source, test selection, tool/config
identity and raw per-file counts. If lines show 0/nonzero but functions or branches
show 0/0 (even with displayed 100%), report those metrics as unknown for that file
and qualify aggregate coverage/threshold claims. Independently forward-review the
raw artifacts and interpretation. Record unsupported metrics and a scoped follow-up
if better instrumentation is needed; no universal reporting adapter is required.

Start with reporting, not a new failing percentage gate: the 80% modernization
target and coverage-directed backfill are later, explicitly scoped work. Preserve
existing thresholds. If tooling/scope validation cannot fit the bounded baseline,
record a deferral with owner, reason and revisit trigger before making coverage
claims or introducing targets; do not block static onboarding on installation.

Preserve existing test commands and regressions when adding instrumentation.
Verify actual test discovery and disclose differences between measured suites and
normal execution. Avoid a second runner solely for coverage when the existing one
can measure the required scope; if necessary, record compatibility limitations
and the cost of parallel suites. DOM-emulator coverage is not browser/E2E proof.

### Developer command handoff

SPEC-TOOL-032/R4–R6: read developer-handoff.md for fresh-terminal command context,
installed identity and exact observation matrices. The optional coverage
capability assessor in assessment-tooling.md checks supplied unexecuted challenge
counts: phantom positive coverage is inconsistent, and missing function/branch
populations remain unknown. It neither collects coverage nor proves source scope.

Before handing off an executable unit baseline, provide a repeatable project-native unit entry point, not only an agent transcript. Prefer the existing task runner (for example test:unit in a JavaScript project); cover any new script/manifest edits in the active spec or a bounded follow-up. If such edits are not authorized, document and verify the exact direct command instead. Do not require a new COVERS runtime or test framework just to launch existing tests.

Record the working directory, prerequisites, account/environment requirements, exact one-shot command, selected files/cases and last observed outcome in the baseline receipt. A developer should be able to paste it into a normal terminal. Preserve actual exit codes, surface setup failures, and verify nonempty intended selection rather than trusting a filtered runner's zero exit. Do not prescribe administrator execution for a developer-account issue.

If pending diagnostics are separated, label the commands preservation-only, diagnostic and combined explicitly. A preservation-only green result is not an all-tests pass. Keep a command that exposes the complete selected baseline including diagnostics; do not force a diagnostic failure to exit zero. For an approved repair, run the same relevant assertion before and after the fix, then rerun preservation and the combined scope. Do not keep a fixed regression excluded or marked expected-failure to sustain the demonstration. Optional watch mode is additional convenience, not the required bounded verification command.

### Prerequisites and resource-aware execution

Test commands must prepare required local generated/shared artifacts before
discovery and stop if preparation fails. Verify from every documented working
directory, including after an authorized disposable fixture has stale/missing
build output. Do not require an undocumented manual build. Preserve the original
setup failure; it is neither product red evidence nor a reason to change assertions.

Resolve the pinned package manager for child task runners as well as the parent
command. Follow workflows/environments.md's process-local Windows recipe and
verify the resolved identity inside a nested task, including a host-fallback
challenge when applicable. Retain the exact developer command and read-only
before/after PATH observations; do not change user/machine PATH or assume
administrator rights. For service-backed checks, use that workflow's owned
shutdown verification before reporting cleanup complete (SPEC-TOOL-030/R5a,c).

Separate ordinary unit latency from real cryptography, persistence and other
intentionally costly boundaries. Record wall time, setup cost, selected cases,
environment and concurrency. Keep real parameters; do not mock the tested boundary
or weaken hashing to meet speed targets. Use bounded serial execution when resource
pressure warrants it. An error following a heavy test does not prove causation.
For pre-discovery environment failures retain diagnostics, permit one materially
justified retry within authority, then stop repeated identical failures for diagnosis.
No supported-helper bypass, blanket elevation or failure-swallowing wrapper.

If order independence is claimed, actually execute the same test identity multiset
in the declared alternate order; a renamed command or separate process alone is
not proof. Record isolation boundaries honestly: a new app object may still share
module-level state. Retain approved regressions in normal verification and use
regression naming after repair rather than an obsolete failing-diagnostic label.

### The testing pyramid: fast feedback first

SPEC-WEB-018/R1-R2 supporting reading: Ham Vocke, [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), MartinFowler.com, 26 February 2018; reviewed 2026-09-19. This practitioner article informs the layered-test approach, not a proven universal ratio. The numerical speed objectives and coverage target below are COVERS policies, not targets attributed to the article. It does not endorse or evaluate COVERS.

SPEC-TOOL-017/R1-R2: recommend a testing pyramid with a broad base of fast, deterministic unit tests, fewer integration/contract tests at real boundaries, and a focused E2E layer covering all agreed critical journeys. Use the lowest layer that faithfully exposes the behavior or defect. Unit tests should carry most input combinations, edge cases, business rules and local state transitions. Integration tests verify actual composition, persistence and service contracts; E2E verifies user journeys and browser-specific behavior that lower layers cannot establish.

There is no fixed test-count ratio: tune the shape to the system's risks and architecture. Do not delete valuable regressions to improve the ratio or mock away a boundary solely to relabel an integration test as unit. A legacy baseline can initially be top-heavy; expand focused unit protection incrementally. Full critical E2E coverage does not mean repeating every unit permutation in a browser.

Make very fast unit execution a first-class quality goal. Suggested, configurable starting objectives: ordinary unit cases take milliseconds (investigate cases above 100 ms); a focused edit loop takes about one second; a small-project unit suite takes about five seconds on recorded reference hardware. These are tunable objectives, not universal hard gates or claims about existing performance. Measure repeated cold/warm suite wall time, startup/setup overhead, slow cases and selection counts separately. A sum of per-file test durations is not isolated suite wall time; parallelism and runner startup matter. Avoid flaky single-run timing assertions.

Keep unit tests local and deterministic, without browser/service startup, real network dependencies or arbitrary sleeps. Substitute external collaborators, not the behavior being tested. Record justified slower checks such as real password hashing separately; do not weaken security parameters, skip checks or mock the very boundary under examination to satisfy speed budgets. Choose a suitable layer for these checks and retain their real execution evidence.

Provide separate commands or equivalent runner projects for each adopted test layer; do not create placeholder integration/E2E commands for deferred layers. Verify actual discovery and fail when a selected required suite finds no tests. Keep the fast unit command usable during each edit; run relevant integration checks after boundary changes and required E2E at validation checkpoints. CI still runs the full required layers. Record baseline timings before adopting a performance ratchet, with team-owned budgets and explicit exceptions. Separate instrumentation overhead from ordinary test speed and preserve honest coverage across all owned source.

### Repeatable initial assessment

SPEC-TOOL-019/R4: when splitting test commands, verify discovered file sets and test-identity multisets against the original combined suite, not counts alone. Parameterized cases may share a display name: preserve occurrences rather than deduplicating away executed cases. Challenge an empty selection and distinguish harness/reporting failures from application regressions. Keep original combined/coverage commands and prior failures visible.

SPEC-TOOL-010/R1-R5: during onboarding or substantial reassessment, read methodology/initial-assessment.md (under .covers/ after adoption) and use scaffolding/initial-assessment.md as a project-owned worksheet. Inventory applicable failure mechanisms across values, state, identity, concurrency, transport, recovery, dependencies and engineering controls; record actual evidence and explicit gaps. Tune depth/tools/domain scope under the project spec without weakening authority, existing gates, honest evidence or traceability. Repeatable inputs and predictable checkpoints are the aim, not a promise of exhaustive defect discovery or deterministic AI output.

In Full, trace created or modified code, tests and authored documentation to governing spec/requirement IDs. Use focused comments, named tests and artifact mappings instead of noisy annotations. Lite keeps intent and actual verification in the quick note without mandatory inline/per-test IDs. In both, behavioral evidence matters more than metadata and direct-edit drift remains visible.

Record revision/local changes and real baseline outcomes. Characterize important valid behavior before refactoring; introduce minimal test seams only under a spec. Known bugs need intended-behavior assertions that actually fail before fixes, then pass afterward with relevant regression checks. Dependency/import failures are not red evidence. Already-correct behavior may pass immediately.

Inventory unit, integration/contract, E2E, lint rules, formatting, type checks, CI and recovery controls. Distinguish declared, installed, configured, runnable, verified and enforced. Use stack-appropriate tools: do not prescribe a browser runner for a library. For browser applications, include all agreed critical success/failure/auth/recovery journeys, not merely smoke tests.

Default modernization target: at least 80% each supported line, branch, function and statement metric across honest scope including unimported modules. Document exclusions. Measure uncovered behavior, prioritize risk, add meaningful assertions, confirm intended paths and rerun. Do not average percentages, inflate exclusions or equate coverage with correctness. Do not demand 80% before any change.

Verbalized sampling broadens test candidates with uncalibrated model response estimates; these are not real failure probabilities. Ground candidates in contracts, deduplicate failure mechanisms, preserve mandatory cases, and select by risk/coverage. Tests remain deterministic; claim random sampling only if actually performed.

Stryker/mutation testing is optional when requested. Pin compatible tooling, start passing, run bounded mutations in an isolated copy, distinguish killed/surviving/equivalent/invalid/timeouts, and verify restoration. Mutation score is separate from coverage. Never mutate production enforcement or a live database.
