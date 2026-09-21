# First baseline and findings review

Governing record: <project spec or Lite quick note>
Project/environment/source identity: <actual values>
Selected depth: <unit-first recommended for a bounded simple project, or expanded with reason>
Optional TypeScript recipe: methodology/typescript-baseline.md (prefix .covers/ after adoption).
Execution authority and network/install boundaries: <actual approval; onboarding is not execution authority>

## Bounded scope

Selected components/behaviors: <small, meaningful set>
Existing mandatory checks to preserve: <commands and scope, or absent>
Time/resource budget and stop condition: <agreed scope; report blockers rather than expanding automatically>

For unit-first, install only the authorized project-native unit tooling needed now. No new E2E runner, browser download, server harness or browser run is included. Add focused integration only when it is the lowest faithful layer for selected behavior. Preserve existing required gates. Do not change application behavior during characterization.

## Evidence

### Run the tests yourself

Working directory and prerequisites: <exact directory, runtime/toolchain, required setup; no admin assumption>
Automatic preparation and failure propagation: <required shared/generated builds; verified stale-output case>
Package-manager resolution for child processes: <pinned tool/shim or not applicable>
Resource-heavy suites: <separate command, timing/concurrency; preserve real security parameters>
Unit entry point: <project-native one-shot command, or verified direct command if scripts are outside authorized scope>
Preservation-only command, if separated: <command and explicit exclusions>
Pending diagnostic command, if any: <command; retain real failure exit and distinguish assertion from setup failure>
Combined selected-baseline command: <command including diagnostics; not falsely green>
Last verified identities/counts, duration, exits and limitations: <actual evidence>

Verify that each command selects its intended nonempty tests. Cover added task-runner scripts in the governing record; do not change business behavior for demo convenience. After an approved repair, run the same regression plus preservation and combined checks; retain the regression in normal verification. Document commands here rather than only in chat.

| Check / selected cases | Command and environment | Actual result / exit / timing | Evidence path and limitations |
|---|---|---|---|
| Original build/type/lint/test commands | Pending | Unverified | Record before configuration changes; absent checks are not passes |
| Unit preservation and boundary cases | Pending | Unverified | No service/browser startup; do not encode suspected bugs as approved behavior |
| Necessary integration boundary, if selected | Pending | Unverified or explicitly deferred | Exercise actual boundary, not a mock of the behavior |

Recommend local coverage reporting with this first executable baseline, reusing
existing tooling or proposing compatible project-local installation within the
reviewed boundary. It is not a static-onboarding prerequisite or automatic install.
Separate meaningful behavioral failures from installation/runner failures. Zero
selected required tests is not a pass. Do not require the modernization coverage
target merely to finish this initial baseline; preserve existing gates.

### Coverage baseline

- Setup: <existing reporter/version or reviewed installation; otherwise owned deferral>
- Command and working directory: <repeatable instrumented command, separate from fast units>
- Artifacts: <console, local HTML, machine-readable report paths; unsupported formats explicit>
- Owned source population: <roots and expected file inventory; include unimported source>
- Exclusions: <dependencies/tests/generated/build output; reasons and unsupported files>
- Denominator validation: <inventory/report reconciliation and known unexecuted file at zero, or disposable-fixture evidence; source-map/double-count checks>
- Suite scope: <actual discovery and differences from retained ordinary tests; no silent runner replacement>
- Results: <raw covered/total and percent for supported lines/branches/functions/statements, by package/component; source identity and timestamp>
- Threshold state: <report-only initially; preserve existing gates; new target/backfill needs scope>
- Limitations/deferral: <owner, reason and revisit trigger before claiming coverage or adopting targets>

A loaded-module-only report is partial evidence, not whole-owned-source coverage.
Keep prior misleading/incomplete reports with corrected interpretation. Reports
remain local unless uploads are separately authorized. Component/DOM coverage is
not evidence of real-browser journeys.

## Consolidated findings and decisions

| Finding ID | Observation and evidence confidence | Proposed intended behavior | Stakeholder disposition / owner | Regression layer / next scope |
|---|---|---|---|---|
| <ID> | <reproduced, source-supported, hypothesis or quality gap> | <proposal, not approval> | <pending> | <lowest faithful layer> |

Link candidate invariant decisions and keep security-risk acceptance separate. For a meeting, present the overview and results, obtain explicit decisions, then select a bounded repair under a spec/quick note: meaningful failing regression, fix, passing regression and preservation checks. Stop for authorization; discovery is not permission to repair. A browser-only defect requires browser evidence before claiming it fixed, or stays deferred.

## Owned deferrals

| Layer / journey / measure | Reason and remaining uncertainty | Accountable owner | Revisit trigger |
|---|---|---|---|
| <E2E journeys or other excluded scope> | <not measured/verified; why deferred> | <name or explicitly unassigned> | <before affected repair verification or relevant release approval, whichever first> |

Assign any unassigned obligation before crossing its trigger. Do not silently drop existing tests or spec acceptance. No automatic transition to E2E after unit success.

## Handoff

Report separately: onboarding setup status; scoped baseline status; approved repair verification; release readiness. Deferred E2E does not prevent completion of an explicitly unit-first baseline, but it supplies no browser or production assurance. Link the next decision and retain reusable tooling lessons without expanding this task.
