# Reproducible environments and execution isolation

SPEC-TOOL-015/R2: preserved workflow guidance, extracted from the former full operating contract. Read the short COVERS.md contract first; higher-priority authority is unchanged. Paths in this reference are repository-root paths in the source distribution; prefix .covers/ after adoption unless already specified.

## Reproducible environments and execution isolation

### Developer-facing local preview

When a local demo is authorized, provide a project-native command for the real
frontend/backend (or applicable components), not an undocumented test substitute.
Record prerequisite builds, synthetic data, auth configuration and exact local
URLs. Prefer loopback binding; verify the actual listener and service identity.
Refuse occupied ports rather than silently reusing or stopping unrelated services.
On Windows, supplement an incomplete listener query with netstat and an owning
process check where permitted. Inaccessible container/process provenance is unknown,
not evidence that ports are free. Do not query unrelated private engine config.

Verify startup failure cleanup and the advertised stop command (including Ctrl+C
when offered) for only owned child processes.
Do not install orchestration dependencies just for convenience without authority.
State whether backend reload is supported and what restarting resets. Temporary
secrets must not be printed. Local binding is not an outbound network sandbox.

SPEC-TOOL-030/R5c: retain an ownership receipt at startup: launcher/child process
identities (including start time), bound addresses/ports and temporary state paths.
Exercise the advertised graceful stop, then verify every owned process exits,
every listener is released and owned state is cleared or explicitly absent.
A successful stop request or lost terminal is insufficient; a failed request is
not shutdown. Bound the wait, retain failure diagnostics and use any authorized
fallback only against verified owned processes, never a process name or port alone.

For Windows, bind `$StopExecutable` to a reviewed absolute native `.exe` path,
`$StopArguments` to reviewed strings, `$OwnedProcesses` to process handles from
the ownership receipt, IPv4 loopback `$Ports` and an owned ephemeral `$StatePath`
expected absent. This recipe supports standard Windows argument parsing, including
spaces, empty strings and trailing backslashes; it rejects embedded quotes, NUL
and newlines. Do not use a shell, batch launcher, custom argument parser or a stop
client that spawns children. Those need a reviewed, bounded project-native recipe
with ownership of every subprocess; a background job alone provides no cleanup.

The ten-second budget includes the native stop invocation and service exits.
On timeout, terminate only the owned stop client and allow up to two additional
seconds to verify its exit; report failure even if cleanup succeeds. This does
not stop surviving services or delete their state. Apply an authorized owned
fallback separately and verify it, including after launcher failure. Track children
independently of launcher liveness; test crash and startup-failure cleanup too.

<!-- R5c-owned-shutdown -->
```powershell
$ErrorActionPreference = 'Stop'
if (-not [IO.Path]::IsPathRooted($StopExecutable) -or [IO.Path]::GetExtension($StopExecutable) -ne '.exe') {
    throw 'Use a reviewed absolute native executable'
}
$quotedArguments = @(foreach ($argument in $StopArguments) {
    if ($argument -isnot [string] -or $argument -match '["\x00\r\n]') { throw 'Unsupported stop argument' }
    '"' + ($argument -replace '(\\+)$', '$1$1') + '"'
})
$stopClient = [Diagnostics.Process]::new()
$stopClient.StartInfo.FileName = $StopExecutable
$stopClient.StartInfo.Arguments = $quotedArguments -join ' '
$stopClient.StartInfo.UseShellExecute = $false
$stopClient.StartInfo.CreateNoWindow = $true
$started = $false
$clock = [Diagnostics.Stopwatch]::StartNew()
try {
    $started = $stopClient.Start()
    if (-not $started) { throw 'Stop client did not start' }
    $remaining = [Math]::Max(0, 10000 - $clock.ElapsedMilliseconds)
    if (-not $stopClient.WaitForExit([int]$remaining)) { throw 'Stop timed out' }
    if ($stopClient.ExitCode -ne 0) { throw "Stop failed: $($stopClient.ExitCode)" }
    foreach ($ownedProcess in $OwnedProcesses) {
        $remaining = [Math]::Max(0, 10000 - $clock.ElapsedMilliseconds)
        if (-not $ownedProcess.WaitForExit([int]$remaining)) { throw 'Owned process still running' }
    }
    foreach ($port in $Ports) {
        $probe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, [int]$port)
        $probe.Server.ExclusiveAddressUse = $true
        try { $probe.Start() } finally { $probe.Stop() }
    }
    if (Test-Path -LiteralPath $StatePath) { throw 'Owned temporary state remains' }
    if ($clock.ElapsedMilliseconds -ge 10000) { throw 'Shutdown timed out' }
} finally {
    try {
        if ($started -and -not $stopClient.HasExited) {
            $stopClient.Kill()
            if (-not $stopClient.WaitForExit(2000)) { throw 'Stop client cleanup unverified' }
        }
    } finally { $stopClient.Dispose() }
}
```

Inventory remote images/fonts/analytics as well as custom APIs. Retain a record of
intentional blocks and user-visible effects (for example missing avatars), separate
from product defects. Restoring an integration needs a reviewed destination/purpose
exception or local fixture; documentation of a destination is not permission to
contact it. Keep synthetic demo restrictions separate from production requirements.

Recommend Docker or an equivalent, such as an approved Podman setup or disposable VM, for a consistent environment across team debugging, builds and tests. Reuse suitable team tooling; a container engine is not a mandatory COVERS dependency. Record the chosen boundary and rationale in the onboarding spec before adding recipes or dependencies. Trusted projects may use an existing local environment when it meets the agreed constraints; unfamiliar or higher-risk code may require a stronger disposable VM boundary or static-only review.

Version the environment definition alongside the project: identify the base image by immutable digest where practical, runtime/package-manager versions, lockfiles, OS/CPU architecture, exact build/test/debug commands, configuration names without secrets, local service fixtures and reset steps. Record the actual image identity used. Preserve baseline dependency versions; upgrades require their own scoped decision. Control clocks, randomness and test data where relevant. Reuse the definition in CI where suitable and document platform differences; containers reduce environment drift but do not guarantee identical outcomes or production parity.

### Child package-manager identity — SPEC-TOOL-030/R5a

An explicit pinned parent invocation does not pin a task runner's nested command
lookup. Compare the declared pin, resolved launcher/entrypoint and version in the
parent and a representative nested task. Challenge a mismatched host fallback in
a disposable fixture. Reuse the project's manager; no language or manager is mandated.

On Windows, review a project-local shim named for the command children invoke.
It must target an already available pinned native executable or a quoted, absolute
runtime plus pinned CLI entrypoint, forward the reviewed arguments and propagate
the exit. A batch shim uses shell argument rules; it is not suitable for arbitrary
untrusted arguments or a shell-free verification profile. Do not auto-download,
reinstall, purge caches, enable global shims or change user/machine PATH.

Bind `$ShimDirectory` to that reviewed directory, `$Manager` to its launcher
filename, `$ExpectedVersion` to its exact version output, and `$TaskExecutable` /
`$TaskArguments` to the reviewed native task entrypoint and argument array. Run
this in the task's working directory, then verify the same identity from inside
the nested task; parent verification alone is insufficient. Retain read-only
user/machine PATH observations before/after and confirm the parent environment is
unchanged. No administrator session or persistent environment changes are needed.

<!-- R5a-process-local-manager -->
```powershell
$ErrorActionPreference = 'Stop'
$savedPath = $env:Path
try {
    $env:Path = $ShimDirectory + [IO.Path]::PathSeparator + $savedPath
    $resolved = (Get-Command $Manager -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
    if ($resolved -ne (Join-Path $ShimDirectory $Manager)) { throw "Unexpected manager launcher: $resolved" }
    $version = & $resolved --version
    if ($LASTEXITCODE -ne 0 -or "$version".Trim() -ne $ExpectedVersion) { throw 'Manager identity mismatch' }
    & $TaskExecutable @TaskArguments
    if ($LASTEXITCODE -ne 0) { throw "Task failed: $LASTEXITCODE" }
} finally {
    $env:Path = $savedPath
}
```

### Execution boundary

SPEC-TOOL-032/R4,R6: for an executable handoff read developer-handoff.md. It
distinguishes lockfile from installed/runtime identity, explicit IPv4 readiness
from a listening port, and manual-demo egress from browser-test interception.
The optional command-context helper in assessment-tooling.md checks an existing
reviewed nested manager before a task; it installs nothing and is not a sandbox.

Treat reproducibility and security as separate acceptance criteria. Inspect image/build recipes, install hooks and test setup before execution. Separate authorized image/package acquisition from restricted builds, tests and application execution; a network-enabled dependency build can run arbitrary code. Where offline execution is required, acquire reviewed dependencies first with lifecycle execution disabled where supported, then run required build hooks only inside the enforced boundary. Keep production data, personal credentials, home directories and engine sockets out of the environment. Prefer non-root processes, no privileged mode, minimal capabilities, bounded resources and narrowly scoped mounts; use read-only inputs and a disposable writable workspace/output area where practical. Record any necessary exception rather than silently weakening isolation.

Explicitly define outbound and inbound network policy, including browsers and test runners. Default container networking is not offline. For a single-container offline workflow, Docker's --network none leaves only loopback: the API, frontend and browser runner must share that network namespace; a normal host browser cannot reach that preview. Multi-service setups need an explicitly verified equivalent policy, local mocks and approved destinations. Binding a port to localhost or intercepting browser requests alone does not prevent server-side egress. Verify configuration and harmless connectivity checks before unfamiliar code runs; never test the boundary by calling real production backends. Export only intended reports/screenshots through the reviewed output path.

During onboarding, distinguish a CLI being present from a usable engine: verify runtime/backend versions, virtualization prerequisites where relevant, engine health and a disposable smoke check, then inspect effective mounts, privilege, resource and network settings. Record commands and observed results, not just the planned configuration. Installation privileges, license/terms decisions and restarts remain explicit user/team actions; running an agent as administrator is not a prerequisite. If the required boundary cannot be established, stop runtime execution and continue static work. Containers share their runtime's kernel and are not a guarantee against hostile code or escape vulnerabilities; use a stronger approved sandbox when the threat model requires it.

Define reset and cleanup for project-owned containers, volumes and test data; preserve diagnostic artifacts and never use broad engine-wide cleanup as a default. This is onboarding guidance, not an automatically installed or verified sandbox. Official references: [Docker network isolation](https://docs.docker.com/engine/network/drivers/none/) and [Docker Engine security](https://docs.docker.com/engine/security/).
