# Optional ESLint diagnostic ratchet

SPEC-TOOL-027/BR1, R1-R4. This opt-in adapter compares individual diagnostics and
their multiplicities against an explicitly reviewed baseline. Adoption copies it
to `.covers/tooling/eslint-ratchet.mjs`; it does not activate a gate, install tools,
choose application rules, change source or autofix. The core stays language-neutral.

## Prerequisites and setup

Use Node >=22 **and** a runtime supported by the installed ESLint and plugins.
Supported flat-config API majors: ESLint 9 and 10. Observed integration: Windows,
Node 22.23.2, ESLint 10.10.0, @eslint/js 10.0.1, typescript-eslint 8.70.0 and
TypeScript 5.9.3. ESLint 10.10.0 declares `^20.19.0 || ^22.13.0 || >=24`, so Node
22.0 is not sufficient for that combination. Other OS execution and real ESLint 9
integration remain unverified.

The explicit project root must expose `node_modules/eslint`. Reviewed dependency
links may resolve outside it; ancestor/global fallback and PnP-only installations
are not supported. Configuration, plugins and dependencies are executable code:
inspect and authorize them first. Disabling fixes does not sandbox plugins.

Review/copy `.covers/scaffolding/eslint-ratchet.json` to a project-owned settings
file, such as `eslint-ratchet.json`. Adapt its targets and identity files. The
optional `.covers/scaffolding/eslint-typescript.config.mjs` is a proposal to copy
to the project root as `eslint.config.mjs`. It requires existing compatible pinned
`eslint`, `@eslint/js`, `typescript-eslint` and `typescript`. It provides syntax
linting, not compiler checks or type-aware linting. Keep existing stricter gates.

Settings schema v1 has exactly these fields:

```json
{
  "schemaVersion": 1,
  "targets": ["src/**/*.ts"],
  "config": "eslint.config.mjs",
  "lockfile": "package-lock.json",
  "identityFiles": ["eslint.config.mjs", "package-lock.json", "tsconfig.json"]
}
```

Targets are nonempty, unique, positive file patterns, expanded independently by
Node's [filesystem glob API](https://nodejs.org/docs/latest-v22.x/api/fs.html#fspromisesglobpattern-options).
Use forward slashes on Windows. Select regular source files, not directories or
repository-wide patterns containing dependencies, generated output or metadata.
Every pattern must measure at least one file; every selected file must be returned,
not ignored, configured and have at least one enabled rule. An ignored file inside
a populated glob is an error. Choose narrower reviewed targets for intentional
exclusions.

All paths except `--root` are canonical root-relative paths: no absolute paths,
backslashes, traversal, empty components, case aliases or negative patterns.
Source and metadata paths cannot traverse symlinks/junctions. Dependency links
are a separate executable trust boundary. Windows device spellings and trailing
dot/space aliases are rejected for portable metadata.

Declare the config, lockfile, imported local config files, relevant tsconfigs and
other configuration inputs in `identityFiles`. The adapter does not discover
undeclared imports/environment dependencies or attest installed package bytes.
A lockfile alone does not prove the installation matches it.

## Commands and exits

SPEC-TOOL-032/R6: finalize the reviewed command wiring and every declared identity
input **before** candidate capture. Then report actual diagnostics, capture to a
new file, review/accept existing debt, and challenge the check with new debt in a
disposable fixture. Capturing first and then changing a hashed package/config
file correctly makes the baseline incompatible; do not edit its hashes or ignore
the mismatch. Retain the old attempt and recapture only through reviewed scope.

Working directory: project root for these commands. Replace the example root and
settings path with reviewed project paths. From another cwd use an absolute
script path; all option paths still resolve against the explicit root.

```powershell
node .covers/tooling/eslint-ratchet.mjs report --root 'C:/path/to/project' --settings eslint-ratchet.json
node .covers/tooling/eslint-ratchet.mjs capture --root 'C:/path/to/project' --settings eslint-ratchet.json --output lint-candidate.json
node .covers/tooling/eslint-ratchet.mjs check --root 'C:/path/to/project' --settings eslint-ratchet.json --baseline lint-reviewed.json
```

`lint-reviewed.json` must be explicitly accepted through project review. Capture
does not accept or rename it. Record reviewer, measured revision/local changes,
command/environment, scope and exceptions in the quality review. Archive prior
evidence before separately authorized replacement/tightening.

| Mode | Exit 0 | Exit 1 | Exit 2 |
|---|---|---|---|
| report | No diagnostics | Diagnostics exist | Invalid/incomplete scan or arguments |
| capture | Candidate created, including existing debt | Not used | Invalid scan/path or existing output |
| check | No new diagnostic debt | New identity/increased multiplicity | Invalid/incompatible baseline or incomplete scan |

Successful scans print JSON to stdout with `exit` and `snapshot`; checks add
`added` and `resolved` deltas. Operational failures print JSON containing `exit:2`
and `error` to stderr. Preserve process exits in wrappers. Capture's zero means
candidate creation, not clean lint or stakeholder acceptance.

Report and check never write baselines. Capture validates first and exclusively
creates a new `.json` file (`wx`) in an existing safe parent. It never creates
directories, overwrites, deletes or cleans up evidence. Concurrent losers fail.
An interrupted write may leave a partial candidate: preserve it for inspection
and choose a new output name. Truncated JSON cannot validate as a baseline.

## Comparison and limitations

Snapshot v1 has exactly `schemaVersion`, `identity`, `files`, `effectiveRules`,
and `diagnostics`. Identity contains `settings` and `adapter` SHA-256 byte hashes,
the `eslint` version and `inputs`, a map from declared paths to byte hashes.
`effectiveRules` maps each measured path to a hash of its effective rules.
Changed identities/rules or removed measured files exit 2 and require reviewed
recapture. New measured files remain included and their diagnostics are new debt.

Diagnostics contain `path`, `rule`, `severity` (1/2), `message`, `context`,
`fingerprint`, and positive safe-integer `count`. The fingerprint is SHA-256 of
JSON of the first five fields, object keys sorted by code point. Context contains
full reported source line(s), CRLF normalized to LF without trimming. Missing
rule IDs, invalid locations/counts, fatal/parser/configuration messages, suppressed
messages, malformed snapshots and no-rule scans fail. Matching fingerprints
aggregate; overlapping patterns must agree on diagnostics and rules and do not
multiply allowances.

Inline directives are disabled with `linterOptions.noInlineConfig`; unused
disable reporting is enabled. Directive attempts reported by ESLint are rejected,
including rule-less configuration warnings. Intentional exceptions belong in
reviewed configuration. Arbitrary processor suppression mechanisms are not
guaranteed discoverable.

Resolved allowances remain until reviewed tightening; reintroducing the same
diagnostic before then can pass. Changed context can conservatively create new
debt. Offsetting totals never cancel distinct diagnostics. Lint/fingerprints do
not prove semantic equivalence, correctness, complete type safety or CI enforcement.

Settings, inputs and measured source are checked for changes during scanning.
Baseline-listed source paths are validated as data and never read. Hostile
concurrent filesystem replacement is outside the reviewed local-tool boundary;
this is not a sandbox for malicious code or race attacks.

## Toolkit verification

From the toolkit source root:

```powershell
node --test tests/eslint-adapter.test.mjs
```

This runs contract fixtures and explicitly skips real integration without an
authorized dependency installation. R1/R4 remain pending after a skipped run.
To run actual adopted integration:

```powershell
$env:COVERS_ESLINT_NODE_MODULES = 'C:/approved/project/node_modules'
node --test tests/eslint-adapter.test.mjs
```

The test creates and adopts into its own temporary project, links only the
dependency directory, writes fixture-owned source/configuration, and launches the
copied CLI from another cwd. It does not install dependencies or run/modify donor
application source. Cleanup unlinks the dependency directory before deleting only
the generated fixture. Independent implementation review remains a separate
required checkpoint.
