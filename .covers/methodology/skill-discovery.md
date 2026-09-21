# Optional fresh-process Codex skill discovery

SPEC-TOOL-030/R3-R4; SPEC-TOOL-032/R3. Use this only when Codex is installed and a fresh repository
catalog check is authorized. It needs Node >=22, no additional packages, no model
turn and no application execution. Other agents retain their own discovery checks.

## Recipe

After successful adoption and byte audit, resolve and inspect the installed native
Codex executable through supported tooling. In normal developer PowerShell:

```powershell
Get-Command codex.exe -CommandType Application | Select-Object Source
```

Review the returned path; a `.cmd`/`.bat` shim is not a native executable. Substitute
the actual absolute executable and target paths below. From an adopted project:

```powershell
node .covers/tooling/skill-discovery.mjs --target 'C:\path\to\project' --codex 'C:\path\to\codex.exe' --timeout-ms 15000
if ($LASTEXITCODE -ne 0) { throw 'Fresh skill discovery failed; preserve the report.' }
```

From a trusted source checkout, use `tooling/skill-discovery.mjs` instead. POSIX
uses the inspected absolute executable path too. No global installation, automatic
executable search, user-config changes or refresh of adopted assets occurs.
The command writes only its JSON report to stdout; retain it explicitly under the
governing record if evidence writes are authorized. Exit 0 means this catalog check
passed, not onboarding completion or application correctness.

The probe validates a nonempty expected COVERS skill set from the adoption manifest,
safe regular local skill files and their recorded hashes. It starts one fresh
`codex app-server --stdio` child and sends only `initialize`, `initialized` and
`skills/list` with the selected cwd and `forceReload: true`. The result must contain
the exact enabled repository (`scope: repo`) skill paths, not merely matching global/plugin names.
It fails on target catalog errors, malformed responses, missing/disabled/duplicate
skills, early process failure, timeout or excessive output, including failures after
the catalog response. It rechecks the original manifest snapshot and local skill
hashes after the child closes; changed bytes or redirected paths invalidate success.
These are point-in-time checks, not a filesystem lock. It closes its own child
and reports cleanup; it never starts a thread/turn or tests the command helper.

## What the evidence means

- `verified: true`: a new local Codex process observed the expected enabled paths.
- `helperHealth: unverified`: separately run `Get-Location` through the actual
  session's supported command tool and record that result.
- `currentSessionActivation: unverified`: this did **not** restart or reload the
  current GUI/CLI session. Fully exit Codex and relaunch from the target if that
  session must invoke newly copied skills; verify actual discovery there separately.
- `startupNetwork: not-assessed`: the helper makes no network requests, but the
  installed CLI may have configured startup telemetry or integrations. Review the
  execution/privacy boundary first; enforce network denial if offline execution is
  required. No model turn is not proof of no process-startup traffic.

Expected count comes from reviewed adopted metadata, not a hard-coded release count.
Skill hashes are not a full toolkit audit or proof of trust. A tampered/incomplete
manifest must be resolved against the pinned distribution rather than edited to
make discovery green. No raw stdout/stderr or unrelated skill catalog is retained;
diagnostics report byte counts and bounded classifications, not private config.

## Safe failure diagnostics

SPEC-TOOL-032/R3. `diagnostics.categories` contains only fixed `code` and `help`
values. These are observed signatures or protocol checks, not a diagnosis of the
current environment. Multiple signatures can coexist; no category overrides
`verified`, the exit result or the cleanup result. A warning signature can also
appear alongside a valid catalog. Unrelated catalog entries are never scanned for
diagnostic hints or included in the report.

| Code | Evidence and supported next check |
| --- | --- |
| `cli-argument-mismatch` | A known argument/option rejection signature; inspect the installed native CLI help. |
| `protocol-mismatch` | A known protocol signature, malformed/unexpected response or standard RPC request/method/parameter rejection; check the reported phase and installed protocol. |
| `home-access-failure` | A known Codex-home access signature; check access in the intended developer account. |
| `permission-denied` | A generic access-denial signature; check the applicable account and access policy. |
| `config-parse-failure` | A known configuration/TOML parse signature; inspect syntax through supported tooling without sharing private values. |
| `unknown` | Discovery failed without a recognized signature or protocol classification; cause remains unknown. |

An arbitrary RPC error, including an internal-server error, does not establish a
protocol mismatch. Without a separate known signature it remains `unknown`; RPC
error messages and data are never copied into diagnostics.

The classifier inspects at most the first `min(maxBytes, 16384)` stderr bytes,
including bytes arriving after a provisional catalog result. It scans in bounded
windows, keeps only a transient 128-byte suffix for split signatures, and drops
that suffix at completion. It does not redact and return excerpts: no raw text,
private paths from child output, configuration values or credentials are emitted.
`stderrInspectedBytes` records the inspected count; `stderrInspectionTruncated`
means additional stderr bytes were not classified. Later signatures may therefore
be missed. `stdoutBytes` and `stderrBytes` still count observed output, and exceeding
the existing per-stream output limit still fails discovery and triggers cleanup.
`rawOutputRetained: false` describes the report; bounded transient protocol parsing
and diagnostic inspection occur in memory.

`diagnostics.phase` is the last protocol phase reached: `initialize`, `skills/list`
or `closing`. It identifies the attempted exchange, not successful activation.
`diagnostics.failedPhase` records the first failed phase, or `null` on success. For
example, a missing skill can fail in `skills/list` before the process enters
`closing`; a nonzero exit or malformed trailing response after a valid catalog
fails in `closing`. `process.exitCode` and `process.signal` retain the child-close
evidence, with `closed` and `forced` describing cleanup. Missing exit/signal data
remains `null`, not a fabricated zero. Timeouts, output overflow, snapshot changes
and unverified cleanup remain failures even if a diagnostic hint is available.

## Recovery

Missing CLI/home access, incompatible protocol or sandbox permissions remain failed
checks. Use supported diagnostics for the exact observed failure; do not infer a
cause from an unrelated MCP warning. If the helper itself works but the authorized
child lacks developer-home access, one explicit, bounded developer-account request
may be appropriate under Windows guidance. Do not bypass an organizational denial
or a broken command helper. Keep partial handoff evidence when recovery cannot run.

Manual fallback: fully exit and relaunch the normal Codex process in the project,
observe project-local skill discovery, and separately verify command-helper health.
Reading SKILL.md manually is not catalog evidence. This probe is optional convenience,
not a required MCP service or a replacement for actual session activation.
Creating a new task does not establish that the desktop process restarted or loaded
new skills. No desktop reload API is assumed. A failed probe always leaves
`currentSessionActivation` and `helperHealth` unverified; retain the failed report
even when using the manual restart fallback.

Protocol reference: [official Codex app-server documentation](https://learn.chatgpt.com/docs/app-server),
consulted 2026-09-20. Compatibility must be observed against the installed CLI build;
synthetic protocol tests alone do not establish it.
