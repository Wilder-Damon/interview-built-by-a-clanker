# Windows Codex onboarding: directory ownership and recovery

SPEC-TOOL-032/R6: use [developer-handoff.md](developer-handoff.md) for fresh-terminal
identity and host-error classification after onboarding. Record observed failures
without inferring causes from signatures. The identity-bound inline preparation
below remains the supported recipe; COVERS does not generate or run ACL repairs.

Read this only for Windows Codex onboarding. The optional diagnostic is `tooling/windows-onboarding-preflight.ps1` in the trusted toolkit, or `.covers/tooling/windows-onboarding-preflight.ps1` after adoption. It requires Windows PowerShell and no packages. It reads identity, directory ownership and ACL metadata; it never changes them. Other platforms and agent environments retain their normal setup.

## Before Phase 0

Run the diagnostic through a supported command tool or from the developer's normal PowerShell terminal, with the actual reviewed paths:

```powershell
& 'C:\path\to\covers\tooling\windows-onboarding-preflight.ps1' -Target 'C:\path\to\project'
```

The onboarding agent may run a read-only check through its supported helper first. If it reports a `CodexSandbox...` identity, that account is not the developer. Offer one supported approval request for the exact read/preparation operation under the intended developer account. Show the target and effects, verify the executing identity before any creation, and request no reusable broad shell permission. Tool approval outside a sandbox is not proof of developer identity or Windows administrator elevation. If that operation is unavailable, denied, or still uses the sandbox account, present the manual terminal fallback. Never route around a failed helper or an organizational denial.

If execution policy blocks the packaged `.ps1`, Codex may use the equivalent permitted inline PowerShell built-ins (`Get-Acl`, identity inspection, and the explicitly approved directory creation below). Do not disable execution policy, encode the blocked script, or retry an operation prohibited by organizational policy.

Interpret the result:

- `agents_missing` (exit 2): offer the approved developer-account preparation operation before copying skills; show the resolved project path. Use manual creation only when that operation cannot run.
- `developer_identity_required` (exit 2): verify through the approved developer-account command path, or ask the developer to run the diagnostic in their normal terminal.
- `owner_review_required` (exit 2): review ownership. A team/admin owner can be intentional and is not proof of a defect. Record the team's resolution and a real helper check.
- `owner_matches` (exit 0): ownership matches the invoking developer; effective write permission and helper health are still **unverified**. This is not permission to apply.
- Errors (exit 1), files at `.agents`, and redirected paths: preserve existing content and resolve the exact path/access problem before applying skills.

For a missing directory, Codex can offer to run the following bounded inline operation through the normal approval mechanism. Substitute the actual absolute project path and the developer account established from trusted session context or confirmed by the developer; do not infer the intended owner from the sandbox token. Check for redirected project ancestors before using the target. The same operation can be run manually in ordinary PowerShell when the command tool cannot run as the developer:

```powershell
$ErrorActionPreference = 'Stop'
$projectPath = 'C:\path\to\project'
$developerAccount = 'DOMAIN\developer'
$expectedSid = ([Security.Principal.NTAccount]::new($developerAccount)).Translate([Security.Principal.SecurityIdentifier]).Value
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if ($identity.User.Value -ne $expectedSid -or $identity.Name -match '(?i)(^|\\)CodexSandbox') {
    throw 'Preparation must run as the intended developer account.'
}
$project = Get-Item -LiteralPath $projectPath -Force
if (-not $project.PSIsContainer) { throw 'Expected a project directory.' }
$ancestor = $project
while ($null -ne $ancestor) {
    if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Review redirected project path.' }
    $ancestor = $ancestor.Parent
}
$agentsPath = Join-Path $project.FullName '.agents'
if (-not (Test-Path -LiteralPath $agentsPath)) {
    New-Item -ItemType Directory -Path $agentsPath | Out-Null
}
$agents = Get-Item -LiteralPath $agentsPath -Force
if (-not $agents.PSIsContainer -or ($agents.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw 'Preserve and review the existing .agents entry.'
}
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$acl = Microsoft.PowerShell.Security\Get-Acl -LiteralPath $agentsPath
if ($acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $expectedSid) {
    throw 'Existing owner differs; review ownership without changing ACLs.'
}
$acl.Owner
```

Rerun the diagnostic or equivalent checks and record the actual outcome. The command must not create `.agents` while executing under a sandbox identity. Creating it under the developer account is intended to prevent the specific sandbox-owner failure observed in a Windows pilot; live cold-start verification is required before claiming it solves that host's problem. No Git repository or admin-mode Codex session is required. A denied approval ends this operation; do not rephrase it into successive prompts.

## Existing failure: show actionable recovery

### Protected-directory write refusal and partial adoption — SPEC-TOOL-030/R1,R4

Ownership is not effective access. Codex can protect `.agents/skills` from sandbox
writes even when `.agents` is developer-owned. A successful read-only preflight or
`Get-Location` does not prove that the apply process can write those directories.
Do not add a hidden write probe to a read-only preview or change ACLs to avoid approval.

If a supported apply actually executes and receives `EPERM`/`EACCES`, retain the
nonzero result and partial checkpoint. This differs from a command helper failing
before execution. When the exact access boundary is established and no operation
has been denied by policy, request one scoped apply under the verified intended
developer identity. Name the exact target and remaining writes; this is not broad
shell access or administrator elevation. A denied request ends this operation.

Re-preview against the **same source version, commit/dirty snapshot and payload**.
Already-copied identical files remain unchanged. Inspect the reported created,
pending and failed paths; the failed write may itself have left partial bytes.
An unchanged permission refusal can resume after authorized access correction.
Partial payload or manifest bytes instead become content conflicts: preserve that
evidence and obtain explicit caller approval to relocate/recover the exact new
partial file before retrying. Never delete existing user content, overwrite a
conflict, edit hashes to pass, or assume changing permissions repairs partial data.
The toolkit does not roll back automatically. Run audit only after complete apply.

If the supported command helper itself fails, use the existing single-safer-retry
and partial-handoff rule, not another account or internal utility as a bypass.

### Confirmed ownership repair

The observed Codex CLI 0.155.1 failure was `setup refresh had errors`, with a sandbox log entry `deny ACE failed on ...\.agents: open deny ACL target for update`. The directory owner was a `CodexSandboxOffline` account. The log identifies the failing operation; the ownership mismatch supports this repair, but generic helper errors alone do not establish that cause. Unrelated MCP warnings must not be treated as evidence.

Explain the affected path, observed owner, relevant error, completed adoption work, and pending steps. Do not keep retrying each file: one safer retry applies to the same helper-failure class across the phase, not a new allowance for every command. If it fails, hand off and stop. A cold restart that still fails calls for diagnosis, not another restart loop.

When this ownership condition is confirmed, guide the developer through a scoped repair:

1. Stop the affected Codex CLI. Record the intended developer account using the identity command above in their normal terminal. Do not derive the intended owner from a different administrator account.
2. Record the existing `.agents` owner and ACL (the diagnostic includes `accessSddl`). Review the exact absolute directory and verify it is a regular directory, not a link or junction.
3. If needed, open an administrator PowerShell terminal for this one operation. Substitute the verified project and developer account below. This changes the owner of **only the `.agents` directory**, with no recursive flag:

```powershell
icacls.exe 'C:\path\to\project\.agents' /setowner 'DOMAIN\developer'
```

4. Verify the exit code, new owner, and unchanged ACL rules. Preserve existing allow/deny entries and inheritance settings. Do not use `/reset`, `/grant Everyone`, `/T`, or blanket ownership changes. If ownership-only repair is insufficient, stop and involve the host administrator; do not broaden the repair automatically.
5. Close the admin terminal. Relaunch Codex normally from the project and ask it to run `Get-Location` through its supported command helper. Resume the existing handoff only if that succeeds. Record the observed result; an ownership check alone is not a successful host repair.

## After Phase 0

Run a minimal supported-helper check (`Get-Location`) immediately after copying the skills, before project-specific evidence writes. The optional [fresh-process catalog recipe](skill-discovery.md) can independently verify adopted paths without a model turn. It does not reload this session: after fully exiting and relaunching Codex, verify the helper again and record actual session skill discovery separately when needed. If any required evidence remains pending, retain partial onboarding status. Do not recopy scaffolding, initialize Git, run application code, or reinstall dependencies to diagnose this host permission failure.

Routine onboarding should run under the developer's normal account. Elevation is limited to an explicitly authorized repair when Windows requires it; running all of Codex as administrator is not the default workaround.
