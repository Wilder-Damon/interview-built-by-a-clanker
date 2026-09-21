# See specs/quick/windows-onboarding-preflight.md. Read-only; no ACL repair.
[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$Target)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$report = [ordered]@{
    schemaVersion = 1
    outcome = 'error'
    reason = 'inspection_failed'
    target = $Target
    agentsPath = $null
    currentUser = $null
    currentUserSid = $null
    owner = $null
    ownerSid = $null
    accessSddl = $null
    inheritanceEnabled = $null
    helperHealth = 'unverified'
    effectiveWritePermission = 'unverified'
    nextStep = $null
}
$resultCode = 1
try {
    $root = Get-Item -LiteralPath $Target -Force
    if (-not $root.PSIsContainer) { throw 'Target must be an existing directory.' }
    # Refuse redirected ancestors too; the developer must select a concrete target.
    $ancestor = $root
    while ($null -ne $ancestor) {
        if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw 'Target or ancestor is a reparse point; use a reviewed physical path.'
        }
        $ancestor = $ancestor.Parent
    }
    $report.target = $root.FullName
    $report.agentsPath = Join-Path $root.FullName '.agents'
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    try {
        $report.currentUser = $identity.Name
        $report.currentUserSid = $identity.User.Value
    } finally { $identity.Dispose() }
    $isSandboxAccount = $report.currentUser -match '(?i)(^|\\)CodexSandbox'
    if (-not (Test-Path -LiteralPath $report.agentsPath)) {
        $report.outcome = 'needs-developer-action'
        $report.reason = 'agents_missing'
        $report.nextStep = 'Offer one supported approved command to create .agents after verifying the intended developer identity, then verify ownership. Manual PowerShell is the fallback. See methodology/windows-onboarding.md (under .covers after adoption).'
        $resultCode = 2
    } else {
        $agents = Get-Item -LiteralPath $report.agentsPath -Force
        if (-not $agents.PSIsContainer -or ($agents.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            $report.reason = 'invalid_agents_path'
            throw '.agents must be a regular directory; preserve the existing entry and review the conflict.'
        }
        # A parent PowerShell 7 process can pass incompatible module paths to 5.1.
        # Load the security cmdlets shipped with this PowerShell executable.
        Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
        $acl = Microsoft.PowerShell.Security\Get-Acl -LiteralPath $report.agentsPath
        $report.owner = $acl.Owner
        $report.ownerSid = $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value
        $report.accessSddl = $acl.GetSecurityDescriptorSddlForm([Security.AccessControl.AccessControlSections]::Access)
        $report.inheritanceEnabled = -not $acl.AreAccessRulesProtected
        $report.outcome = 'needs-developer-action'
        $resultCode = 2
        if ($isSandboxAccount) {
            $report.reason = 'developer_identity_required'
            $report.nextStep = 'Use the supported approval path to check as the intended developer, or use their normal PowerShell terminal. A sandbox account cannot establish the intended human owner.'
        } elseif ($report.ownerSid -ne $report.currentUserSid) {
            $report.reason = 'owner_review_required'
            $report.nextStep = 'Review the owner with the developer. Different ownership can be intentional. If sandbox-created ownership caused the logged ACL failure, follow the scoped repair in methodology/windows-onboarding.md; preserve ACL rules.'
        } else {
            $report.outcome = 'ready-for-helper-check'
            $report.reason = 'owner_matches'
            $report.nextStep = 'Owner matches this developer session, but effective write permission and helper health remain unverified. Protected skill paths can still need scoped developer-account apply. See methodology/windows-onboarding.md; verify Get-Location separately after Phase 0 and cold restart.'
            $resultCode = 0
        }
    }
} catch {
    $report.outcome = 'error'
    $report.nextStep = $_.Exception.Message
    $resultCode = 1
}
$report | ConvertTo-Json -Depth 3
exit $resultCode
