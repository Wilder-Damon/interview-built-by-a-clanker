# Optional assessment automation

Governing specs: SPEC-TOOL-020/R1-R3, SPEC-TOOL-021/R1-R5, SPEC-TOOL-028/R1-R5 and SPEC-TOOL-030/R2. These commands reduce repeated mechanics; they do not grant execution, disclosure, dependency-change or release authority. Run from the COVERS source as `node tooling/cli.mjs` or an adopted project as `node .covers/tooling/cli.mjs`.

## Dependency inventory and advisory review

`deps --target .` reads a supported npm `package-lock.json` v2/v3 or pnpm lockfile and prints an exact direct/transitive inventory without network or writes. Unsupported/malformed records fail instead of becoming an empty result. Classification is conservative metadata evidence.

`deps --target . --output specs/security-results/dependencies` explicitly creates `inventory.json`, a disclosure-authorization proposal and a triage worksheet; it refuses an existing destination. Review every identity. To use the optional OSV adapter, edit the authorization file to contain only exact public package/version records and actual approval, then run:

```sh
node .covers/tooling/cli.mjs deps --target . --output specs/security-results/dependencies-run-2 --provider osv --authorization specs/security-results/reviewed-authorization.json
```

This contacts only the fixed OSV batch endpoint and saves the normalized result. Redirects are rejected before forwarding; already-redirected responses are refused defensively. It never uploads source or the lockfile and never auto-upgrades. Private/unknown/extra identities, absent approval, transport/HTTP/JSON failures and result-count mismatches fail closed.

The advisory report's `outcome` is `complete` only for the authorized query subset, not the entire dependency inventory. Per-query errors, malformed result/vulnerability records and pending or malformed pagination make it `incomplete`; valid findings are retained with package-linked `queryErrors`. The CLI prints the partial report, saves it when `--output` was requested, and exits 1. An absent or empty `vulns` array in an otherwise valid result is a legitimate no-match, not missing evidence. A nonempty `next_page_token` means additional results remain; this adapter deliberately does not make extra pagination requests. See the official [OSV batch pagination contract](https://google.github.io/osv.dev/post-v1-querybatch/#pagination). An approved organization/local scanner can replace this adapter; preserve equivalent fields. A match is not automatically exploitable; no match is not security clearance.

## Static Docker preflight

`docker-preflight --target . --compose compose.yaml` parses Compose without contacting Docker. It reports declared user, read-only mode, dropped capabilities, no-new-privileges, privileged/host namespace modes, devices, mounts, loopback publishing, internal networks and health checks. Review statuses are not passes. The report lists mandatory dynamic checks for effective ports/mounts, actual writes, egress, identity, health and recovery. Starting services remains separately authorized.

## Fast and full verification

SPEC-TOOL-030/R2: copy `scaffolding/verification.json` to `.covers/verification.json`
and populate its empty profiles with reviewed direct executable records for
the current host. For example, this Windows record runs Node's test runner directly
(use the inspected Node path and an existing test file):

```json
{"id":"unit","command":"C:\\Program Files\\nodejs\\node.exe","args":["--test","tests/unit.test.mjs"],"required":true,"timeout_ms":300000}
```

`verify --target . --profile fast` is plan-only. Inspect it; add `--run` to execute
with `shell:false`. On Windows, both modes reject `.cmd` and `.bat` commands,
case-insensitively, anywhere in the selected profile before executing any command,
including a valid command listed earlier. This also applies to optional commands.
The CLI reports the error and exits nonzero. There is no automatic shell fallback;
POSIX executable handling is unchanged.

Keep the executable and each argument in separate JSON fields/elements. Do not add
shell quotes around a path containing spaces, concatenate a command line, or put
redirection/pipelines in `command`. Direct Node arguments preserve literal spaces
and metacharacters. Omit `cwd` to run at the target repository root. An explicit
`cwd` is relative to that repository and must remain within it. Use a reviewed
native executable or a reviewed Node entrypoint for a tool that normally ships a
Windows batch launcher.

For npm, first inspect `process.env.npm_execpath` when the parent was started by
npm; otherwise inspect runtime-adjacent locations. Do not assume npm is globally
installed at a fixed path or infer its JavaScript entrypoint from a PATH launcher.
A common Windows installation uses `C:\Program Files\nodejs\node.exe` with
`C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`; these example paths
are not discovery results for another developer's machine.
Confirm the absolute entrypoint exists and belongs to the reviewed npm installation
before using it. For that installation, a local reviewed package script can use:

```json
{"id":"npm-unit","command":"C:\\Program Files\\nodejs\\node.exe","args":["C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js","--offline","--no-update-notifier","run","test:unit"],"required":true,"timeout_ms":300000}
```

COVERS starts Node without a shell, but **npm internally uses a script shell** to
evaluate package scripts, including applicable pre/post scripts. Review the script
bodies, their dependencies and all forwarded arguments. This npm recipe is not a
promise that arbitrary untrusted npm-script arguments remain literal or safe.
Use direct Node execution when literal argument handling is required. npm's offline
flag does not prevent a package script from making its own network requests.

The retained `SPEC-TOOL-030/R2` cases run with
`node --test --test-name-pattern=SPEC-TOOL-030/R2 tests/assessment-tools.test.mjs`
from the toolkit checkout. They exercise Windows plan/run rejection before a
sentinel, the CLI's nonzero exit, a real local npm script through its absolute
entrypoint, direct Node tests, literal arguments/cwd, failures, short-circuit and
bounded timeout. The POSIX executable-suffix case requires a POSIX host; a Windows
skip is not POSIX execution evidence.

A required failure stops later commands. The receipt preserves ID, executable,
arguments, cwd, required flag, exit/signal, duration and bounded output. Optional
`--output specs/results/fast.json` refuses overwrite. Fast normally favors focused
unit/type/lint checks; full includes every required integration/E2E/coverage/security/build
gate. Configuration is executable project policy and requires review. COVERS does
not discover commands or weaken full gates automatically.

An empty verification profile is allowed while authoring a plan (exit 0). Explicitly running it returns `executed: false`, `outcome: incomplete`, an actionable reason and exit 1. Optional-command failures remain `passed-with-warnings`; required failures remain `failed`. A command exiting 0 does not prove it discovered tests: inspect runner selection/counts separately.

## Optional fresh command context — SPEC-TOOL-032/R4

Use a project-native wrapper when it already solves the handoff. Otherwise adapt
`scaffolding/command-context.json` to existing reviewed paths; this separate helper
does not create shims or install a manager. Plan first; execution is explicit:

```sh
node .covers/tooling/command-context.mjs --target . --config command-context.json
node .covers/tooling/command-context.mjs --target . --config command-context.json --run
```

Schema v1 uses target-relative `cwd`, `shimDirectory` and `manager.path`, plus
`manager.name` and `expectedVersion`. Each `parentProbe`, `nestedProbe`, and `task`
has an absolute existing native `executable` and string `args` array. A Node
entrypoint is an argument, not a `.cmd` executable. The manager launcher can be a
reviewed batch shim, but configured direct commands must be native. Package
scripts or explicitly reviewed native shells remain their own executable trust
boundary. Do not put credentials in these records; plan output prints them.

Both probes must emit only `{"path":"absolute resolved launcher","version":"exact version"}`.
They are executable project code: independently inspect that the parent actually
resolves/queries the manager and the nested probe exercises the representative
task runner's lookup. Do not hardcode expected JSON or use an echo as verification.
The helper checks output identities, not the truth of arbitrary probe programs.
Existing packageManager pins between cwd and target must match. Child PATH is
prepended in a copy; the parent and persistent environment are untouched.

Plan validates but launches no child. Run stops before the task on a failed or
mismatched identity. It reports actual direct-child exits/signals and preserves a
nonzero task exit; timeout uses 124 and output overflow 125. `timeoutMs` is 1–60000
per child (default 15000), `maxBytes` 1–4194304 (default 65536). This bounded helper
is for short one-shot tasks, not services. It does not terminate descendant trees
or enforce network isolation. Child output is counted, not retained; the normal
developer runner must retain useful test results separately. For longer suites
use a reviewed project-native wrapper or the existing verify profile with its
explicit timeout. Do not add automatic downloads, shell fallbacks or global PATH
changes to work around an identity failure.

## Optional coverage capability check — SPEC-TOOL-032/R5

Copy `scaffolding/coverage-capability.json` to a reviewed project-owned JSON file.
Set its existing Istanbul-style JSON-summary path, explicit requested thresholds,
and one or more existing unexecuted challenge source files. For each challenge,
review whether lines, statements, functions and branches have executable population
(`present` or `absent`). A useful disposable challenge exports a conditional
function and remains unimported by the measured suite. Retain the actual test
selection and source/config identity; setting `unexecuted: true` is a declaration,
not independent proof that the suite did not execute it.

```sh
node .covers/tooling/coverage-capability.mjs --target . --config coverage-capability.json
```

This separate dependency-free helper reads only supplied local files and prints
JSON. It does not run tests, collect coverage, infer source populations, rewrite
reports or upload anything. Counts and displayed percentages remain separate;
threshold arithmetic uses covered/total counts. Missing files/metrics, expected
populations reported as 0/0, and declared-unexecuted code reported covered qualify
the metric as unknown/inconsistent. Reviewed absence is not applicable, not 100%.
Aggregate counts must equal the sum of all supplied per-file counts for the
metric; missing populations or disagreement prevent claimed attainment. This
checks internal consistency, not whether every owned file was actually supplied.
Only requested metrics affect aggregate outcome; others remain explicitly unclaimed.
CLI exit 0 means those supplied challenges and reported thresholds were satisfied,
not that the complete owned denominator, source maps, report freshness, correctness
or release readiness were established. `incomplete`, `failed`, or malformed input
returns nonzero. Review its hashes and raw counts with the underlying artifacts.

## Closeout receipt

Copy and adapt `scaffolding/closeout.json`. Record JSON-safe environment/runtime/tool identities in `context`. `receipt --manifest .covers/closeout.json` verifies safe local evidence paths, hashes exact bytes and preserves reported passed/failed/blocked/not-run outcomes. `--output` explicitly writes a new JSON receipt. Missing evidence fails; any failed check makes the aggregate failed and blocked/not-run remains incomplete. An empty checks collection is also incomplete, never passed; incomplete and failed receipts exit 1 while retaining their report. Hashing and aggregation do not execute checks, establish substantive evidence (including for zero-byte files), verify claims or approve release. Review retained command output for secrets before sharing a receipt.

## Cold-run measurement

Use `scaffolding/dry-run-scorecard.md` with another contributor who relies only on distributed artifacts. Measure elapsed and active time, interventions, decisions, downloads, failures, diagnostics, test wall times, review/rework and unresolved risk. Label comparisons non-comparable when definitions or denominators differ. Feed reusable friction into a new COVERS spec; keep project-specific findings in the project.
