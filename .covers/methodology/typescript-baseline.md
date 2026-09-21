# Optional TypeScript unit-first recipe

Use with workflows/testing.md, the project's spec/quick note and baseline worksheet.
This is a recipe, not an installer or a claim that every TypeScript project uses
the same tooling. Reuse existing runners and gates. Scope package/lockfile changes
and dependency acquisition before installing. No browser or remote service required.

## Start from the project, not the tool's directory

Run package-manager version/install commands in the explicit project directory
so its pinned packageManager field is honored. Inspect child task resolution too:
calling Corepack for the parent does not ensure Turbo's child uses that version.
If needed use a reviewed project-local pnpm.cmd shim calling `corepack.cmd pnpm %*`
and prepend its directory only for that process. Preserve failure exits. Do not
enable implicit dependency purge, alter global PATH or use administrator mode to
mask a mismatched runner. Capture original build/type/lint outcomes before changes.

## Test setup and commands

For a project without tests, Vitest with a compatible, exactly pinned V8 coverage
provider is one supported starting choice. Use the installed project's dependency
policy and runtime compatibility; no automatic latest upgrade. A Node environment
is sufficient for pure units and in-process API injection. React component DOM
testing, browser/E2E and service startup are separate scope decisions.

Provide ordinary unit, focused regression and coverage commands; a focused API
composition command is useful when that is the faithful layer. Prepare required
shared/build artifacts before discovery, propagate setup failure, and verify
recovery from missing generated output in a safe retained/disposable fixture.
Record preparation, runner and total wall time separately.

**Challenge name filtering.** A file can be discovered while every test is skipped
and the runner still exits zero. For Vitest, a JSON reporter can accompany normal
output (`--reporter=default --reporter=json --outputFile=<unique-local-path>`).
Check a fresh report: at least one assertion executed (passed or failed), not
merely `numTotalTests` which may include skipped tests. Preserve runner failures;
missing/malformed reports and zero executed selections must not become green.
Record actual case identities/counts and challenge an unmatched test-name filter.
Reporter shape/options must be verified against the pinned runner, not assumed
portable to other test tools. Do not suppress failing diagnostics for a demo.

## Owned-source coverage

Specify every owned source root, including untouched frontend/backend/shared code.
Exclude only justified tests/generated/dependency/build populations. Request console,
local HTML and JSON counts when supported; keep instrumentation separate from the
fast edit loop. No initial percentage target and no external upload by default.

Workspace packages may resolve to compiled dist outside coverage includes. Validate
source remapping; a source alias can be appropriate for source-level tests but is
not proof of built-package exports. Label that boundary and retain a separate built
contract check if needed. Do not hide source behind dependency/externalization rules.

Compare report paths with the expected source inventory. Verify a known unexecuted
file at zero, check each package, and retain raw counts plus percentages. A fully
covered schema initializer does not prove its validation policies. If the first
report measured the wrong scope, preserve it as limited evidence and start a new
comparable baseline before setting a target. Do not copy percentages across runs
with changed exclusions, source populations or test selection.

## Lint and presentation

Arrange requested independent review before implementation. A delegated worker
may not have nested-agent tools even when its coordinator does. If unavailable,
return a concise local review packet to the coordinator or designated human and
keep the checkpoint pending. Do not treat a new external review service/CLI as
an interchangeable local subagent or infer permission to transmit source, tests
or findings. A denied transport is not a reason to try an indirect route.

Use methodology/eslint-adapter.md for the optional reusable no-new-debt adapter
after reviewing its supported scope and actual test evidence. Start with raw
reporting, review existing debt, then explicitly select ratchet policy. Do not
rewrite a comparator independently in every target or call a zero-task lint
wrapper enforcement. TypeScript compilation remains a separate check.

At handoff provide a short developer/demo document with cwd, exact commands,
expected current outcomes, retained red evidence, selected source diff and open
findings. Do not reintroduce a bug into the working copy solely for presentation.
Onboarding activation, repair verification and release readiness stay distinct.
