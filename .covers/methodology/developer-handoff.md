# A handoff that works in a fresh terminal

SPEC-TOOL-032/R4–R6. Use relevant checks when handing executable work to another
developer; this is not another mandatory onboarding stage. Source paths below gain
`.covers/` after adoption. Preserve failures and old receipts; reconcile living
guidance under the current spec or quick note.

## Commands and installed identity

Verify the advertised command from its documented working directory in a fresh
process without the author's temporary PATH. Record runtime, manager, selected
tests, exit, setup cost and measured scope. A parent invocation through Corepack
does not establish what Turbo or another child resolves. Use the optional reviewed
command-context helper described in assessment-tooling.md or a project-native
equivalent; never require an undocumented session shim.

Keep dependency states separate: declared manifest, resolved lockfile, installed
package identity, linked workspace package, and executed module. A lockfile-only
update does not relink node_modules. Inspect actual workspace runtime resolution
after an authorized frozen install. Preserve the original failure and distinguish
stale build output from an application defect. Do not prescribe force installs,
store/cache deletion, global Corepack activation or upgrades to make evidence fit.
Windows workspace tools may need an explicit runtime alias/entrypoint; propose it
only after a reproduced mismatch, cover manifest/lock changes, and verify the
nested resolved version.

## Readiness and preview identity

Use explicit loopback addresses consistently: a server bound to `127.0.0.1`
needs an IPv4 readiness URL; `localhost` may resolve to IPv6. A port and HTTP 200
alone do not identify the intended application. Retain the owned executable,
arguments, cwd, effective config path, start identity, expected response marker
and actual listener. Refuse an occupied port of unknown ownership.

Inventory outbound API, avatar/image, font, analytics and other destinations for
the **manual demo**, independently of test interception. A Playwright route mock
protects only that browser context; it does not make the real preview offline.
Use a reviewed demo-only local fixture or destination exception and verify the
actual served response/browser requests. Do not silently change production data
or describe loopback binding as an outbound sandbox.

Exercise the advertised stop and inspect owned processes, listeners and temporary
state afterward using workflows/environments.md. Distinguish the launcher exit,
an outer npm/cmd wrapper exit, the stop request, and actual cleanup. Ctrl+C can
reach wrappers differently: retain a nonzero wrapper exit instead of claiming all
commands passed because a port was released. Do not kill by name or port alone,
and do not hide an exit with `exit 0`.

## Evidence and reconciliation

Before independent review, make a compact requirement-to-observation matrix:
requirement ID; exact assertion/command; selected cases; expected observation;
actual result; source/config identity; limitation. A positive result for a nearby
condition does not establish the exact claim. Transport repairs need the real
method/body/header boundary; a mocked helper may miss middleware failure.
Keep tool/environment errors distinct from meaningful failing product assertions.

For known defects preserve the same intended-behavior assertion before and after
repair. For new tooling challenge invalid/unknown inputs and valid paths; do not
manufacture a missing-import failure as behavioral red evidence. A passing command
with zero selected tasks is not a gate. Disclose unsupported metrics and unexecuted
layers; a review score is not assurance.

Transition a reviewed Full spec from ready to in_progress before implementation,
then use the single coordinator's checkpoint in workflows/specification.md.
This is accountability, not automatic action interception. At handoff reconcile
README/AGENTS commands, defect and security dispositions, invariant approvals,
wiki summaries and open work. Preserve historical approvals, failed runs and
completed specs; a new amendment records a changed outcome. An implemented
security repair is separate from acceptance of residual risk.

For lint ratchets finish command/config wiring before candidate capture, retain
diagnostics, obtain debt acceptance and challenge the gate with a new diagnostic.
See eslint-adapter.md. For coverage read assessment-tooling.md's capability helper
before claiming unimported function or branch populations. Neither helper replaces
review of the raw artifacts.

## Host failures are not application failures

Record the exact local diagnostic privately and the operation that failed. A
signature such as `uv_os_get_passwd`/`ENOMEM`, a permission refusal or a helper
startup failure is evidence of that failure, not proof of its underlying cause.
Use the Windows guide and supported one-safer-retry rule. Do not infer memory
exhaustion from an error name or make administrator execution the default.
Discovery reports intentionally expose only safe diagnostic categories; inspect
private logs separately under authority without copying secrets into receipts.
