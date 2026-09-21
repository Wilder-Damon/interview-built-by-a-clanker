# Project setup and cold handoff

SPEC-TOOL-015/R1-R6. This file is distributed as .covers/methodology/setup.md; the application README is not the toolkit setup guide. Read COVERS.md first. The toolkit is optional scaffolding, not permission to run the app or overwrite existing governance.

## Establish the boundary

Record target revision/local edits, existing specs, root/ancestor/nested AGENTS.md and tool-specific steering, runtime scripts, dependencies, external services and privacy constraints. Inspect before running unfamiliar code. Choose local, container or stronger isolated execution to fit actual risk; Docker is useful, not mandatory. Read workflows/environments.md and workflows/onboarding.md. Use initial-assessment.md and the distributed onboarding worksheet for the evidence inventory. Resolve conflicting authority before affected changes.

SPEC-TOOL-019/R1-R4: choose Full or Lite for the onboarding task, not permanently for the repository. Record shared constraints/defaults and recommend again for each task or feature; both workflows may coexist. Full uses an onboarding/master spec before setup edits. Lite uses a quick note and workflows/lite.md; no master, registry or invariant catalog is mandatory merely to start a bounded Lite change. Preserve any existing formal records and gates. Choose retain/coexist, bridge or separately scoped migration for existing specs. Toolkit provenance is not project authorization.

## Start from Codex CLI

SPEC-TOOL-024/R1-R5. Obtain a reviewed private COVERS clone through approved access, then install it once as a local skills-only plugin:

```sh
codex plugin marketplace add "/absolute/path/to/private-covers-clone"
codex plugin add covers@covers
```

On Windows, quote the absolute path, for example `"C:\path\to\private-covers-clone"`. Do not publish this pilot to a public plugin directory or expose the private source location to unauthorized users. Start a **new Codex CLI session** from the explicit target repository after installation or upgrade, then invoke `$covers-onboard`. The first result is a fast read-only developer overview: apparent purpose and architecture, stack/entry points, test and quality posture, external boundaries, existing guidance/specs, unknowns, and a Full or Lite recommendation. Codex shows that overview and the exact adoption preview before applying anything.

The skill distinguishes bootstrap mode (no `.covers`) from adopted mode, resolves the toolkit from its installed location and uses dependency-free `tooling/bootstrap.mjs`. It must not assume a language, framework or package manager; reuse a prior project's target path; overwrite conflicts; install target dependencies; or run target application code. An onboarding request may authorize nonconflicting Phase 0 COVERS assets after overview and preview, but it does not authorize target runtime execution, hooks, CI, containers, external calls or credentials.

After apply, use copied `.covers/methodology` as project-pinned authority while the already-loaded plugin skill finishes this phase. Create or reconcile the selected Full master spec or Lite quick spec before project-specific setup edits. Persist the reviewed overview and scorecard at `specs/reviews/covers-onboarding-overview.md` and `specs/reviews/covers-onboarding-scorecard.md`, or record reconciled equivalents under an existing system. Reconcile `AGENTS.md` rather than replacing existing instructions. For cold catalog evidence use the optional [fresh-process discovery recipe](skill-discovery.md), or fully exit Codex and relaunch it from the target directory. A probe does not reload the current session or prove helper health; do not treat an in-process refresh as cold-start evidence. The plugin is a bootstrap convenience; committed project-local guidance is what makes adoption repeatable for a team and portable to other supported agents. SPEC-TOOL-030/R3-R4.

Before commands, batch expected approval boundaries: one bounded read request, one isolated COVERS parser-install request if needed, one COVERS evidence-write request and one metadata-check request per phase. Do not repeatedly rephrase the same request. Never locate or invoke internal patch utilities or broaden access to bypass a failed supported helper. Retry only once when the retry is materially safer. Otherwise keep receipts honestly pending and use `scaffolding/onboarding-handoff.md` to record completed checks, pending evidence, the exact observed error, unchanged boundaries and the next resume request. Do not assign an unverified cause to the failure.

## Acquire and adopt

Windows Codex onboarding includes the [ownership preflight and developer recovery guide](windows-onboarding.md). Before `--apply`, inspect the explicit target with `tooling/windows-onboarding-preflight.ps1 -Target <path>` from the trusted toolkit or equivalent permitted inline checks. If `.agents` is missing, offer one supported approved creation command, verifying the intended developer identity before creating it and ownership afterward; manual PowerShell is the fallback. Existing ownership problems require reviewed, scoped recovery, never automatic ACL resets. Verify a supported-helper command immediately after Phase 0 and again after restart. The adopted diagnostic lives at `.covers/tooling/windows-onboarding-preflight.ps1`. This is an onboarding check; the standalone adoption CLI does not enforce Windows account policy.

Use a reviewed COVERS clone pinned to an exact commit. First-run adoption requires only Node >=22; it does not require npm packages, global packages, MCP or Git metadata in the target. After adoption, npm supplies the pinned YAML parser for formal spec commands. Git is needed only for revision, working-tree and drift checks; pre-source-control projects continue with those signals explicitly unavailable, and COVERS never initializes Git implicitly. From that source clone, after inspecting the bootstrap script and obtaining adoption authority:

```sh
node tooling/bootstrap.mjs --target /absolute/path/to/project
# Review the preview; only then apply within setup authority:
node tooling/bootstrap.mjs --target /absolute/path/to/project --apply
```

On Windows use quoted paths, e.g. "C:\dev\project", and npm.cmd in an interactive PowerShell terminal if it blocks npm.ps1 (the shell-free `verify` runner instead needs a direct executable; see assessment-tooling.md). init copies .covers and .agents/skills only; it does not modify app files, create live specs/wiki, install packages, run Git, enable hooks or configure credentials. It refuses differing files/symlinks before writes. Apply I/O failures emit a partial checkpoint and exit nonzero; preserve created/pending/failed paths and re-preview the same source snapshot. A partial failed file may conflict and needs caller-controlled recovery, not automatic deletion/overwrite. Ownership does not prove write permission: see windows-onboarding.md for scoped protected-directory recovery. SPEC-TOOL-030/R1,R2,R4.

## Finish inside the target project (Full)

For Lite, inspect the boundary and provenance, create the governing quick spec first, then reconcile AGENTS.md under that record and use existing project tests when authorized (SPEC-TOOL-030/R4). Install the pinned parser only if using the CLI; report-only drift works without a formal catalog/registry. Do not run formal validate/index/readiness as quick-note prerequisites. The following Full sequence applies to teams retaining formal governance.

1. Inspect .covers/adoption.json: toolkit version, exact source commit/dirty state when known, and payload hashes. Null source identity means unknown (e.g. an archive), not a verified clean release. audit checks bytes, not trust. Reject an unexpected dirty source under your team's release policy.
2. Populate specs/1_active/<master>.md before other project-specific setup edits, and specs/invariants.json from proposals only where absent; otherwise reconcile. Adapt IDs, domain, scope, key_decisions and acceptance before ready. Empty invariants are honest; invented rules are not. Review root .gitignore so all node_modules and private data stay excluded. No application package.json changes are needed for toolkit setup.
3. Review .covers/scaffolding/AGENTS.md as a proposal under that governing record. Create a project-specific root AGENTS.md if none applies, checking case variants/overrides first. Otherwise merge deliberately; preserve team guidance. Link the governing spec, .covers/methodology/COVERS.md, registry, execution boundary and known commands. Do not create a competing CLAUDE.md or assume every agent discovers .agents/skills; verify the actual tool/adapter separately.
4. Install the isolated pinned parser, explicitly generate the registry, then verify:

```sh
npm ci --ignore-scripts --prefix .covers
node .covers/tooling/cli.mjs index --target .
node .covers/tooling/cli.mjs validate --target .
node .covers/tooling/cli.mjs audit --target .
node .covers/tooling/cli.mjs readiness --target . --spec SPEC-YOUR-ID
```

5. Plan the first executable baseline separately from onboarding setup. Recommend unit-first for a bounded simple project, independently of Lite/Full; use `workflows/testing.md` and `scaffolding/baseline.md`. Inspect application commands before authorized execution; record actual successes, failures and gaps. Preserve existing gates and record integration/E2E deferrals with owners and revisit triggers, without automatically installing browser tooling. Present consolidated findings for stakeholder decisions before a bounded spec-led repair and failing-then-passing regression. Do not run production backends or copy sample-specific tests. Optional wiki setup uses covers-knowledge and its own bounded source list.
6. Read `assessment-tooling.md`. Optionally run the offline `deps` inventory and static `docker-preflight`; external advisory lookup and project command execution remain explicit decisions. Adapt the verification and closeout templates rather than accepting placeholders as evidence.
7. Have a teammate/agent use only retained project artifacts for a bounded spec-covered change: a committed revision where available, otherwise an identified filesystem snapshot with Git-derived evidence explicitly unavailable. Do not initialize Git just for this handoff. Record setup interventions, review time, discoverability and results in the dry-run scorecard. Manual skill reading is not proof of automatic discovery. Commit/push only with applicable authority.

Keep records proportional: for a small library, one onboarding/master spec and one consolidated evidence/review receipt can hold the inventory, decisions and command results. Templates are prompts for applicable evidence, not mandatory separate documents for every command or metric. Reuse existing records and mark unsupported measures explicitly; do not manufacture process work merely to fill forms.

### Activation evidence versus separately authorized work

Pending automatic skill discovery is not itself a prohibition on a separately
authorized bounded test baseline. With a healthy supported helper and explicitly
read project-pinned guidance, the current agent may carry out that separate
scope while retaining incomplete activation/onboarding status. Manual reading
never substitutes for automatic-discovery evidence. A failed helper still follows
the stop/recovery rule; this distinction does not authorize another command path,
broader permissions or repeated retries. A fresh CLI catalog observation and a
successful command-helper observation are separate checks, not a single exit code.

## Check a bounded change

Read formats.md. Supply explicitly reviewed IDs, never derive selection from all active specs:

```sh
node .covers/tooling/cli.mjs drift --target . --base main --spec SPEC-YOUR-ID --mode local
node .covers/tooling/cli.mjs drift --target . --base HEAD --spec SPEC-YOUR-ID --mode index
node .covers/tooling/cli.mjs drift --target . --base origin/main --spec SPEC-YOUR-ID --mode branch
node .covers/tooling/cli.mjs readiness --target . --spec SPEC-YOUR-ID --phase complete
```

local includes branch, staged and unstaged/untracked layers. For index checks stage reviewed spec metadata alongside code; branch checks require matching committed metadata. Snapshot mismatch means review the correct snapshot, not bypass the check. Initial unborn Git repositories need a reviewed baseline commit before drift; metadata commands work without Git. An add then subsequent unstaged edit may need both add and modify scope; an exact rename needs both endpoints. Run substantive project tests independently.

SPEC-TOOL-016/R2: a rename plus substantial rewrite can be reported by Git as deletion/addition because rename detection depends on content similarity. In that case a rename-only spec fails safely: review the same-layer diff and amend scope to exact delete(old)/add(new) records before continuing. See formats.md for the full workaround; do not weaken the gate.

The optional pre-commit proposal takes explicit COVERS_SPECS IDs and checks index state; merge into an existing hook manager only when authorized (Husky or equivalent). CI uses branch mode and a reviewed explicit specs/change-selection.json list. Its selection and governing spec changes require human review. Source COVERS CI is distinct from target app CI and from protected-branch enforcement. No automatic deployment or protection changes.

Keep implementation specs active through integration. After acceptance verification and integration, capture verification revision/evidence/outcome, run completion readiness, and move to 2_completed in a metadata-only follow-up. Completed/history specs remain immutable evidence; future behavior changes get a new amendment spec.

SPEC-TOOL-032/R2: for deliberately non-Git work, formats.md documents an explicit
`readiness --phase local` gate and `verified_local` status in 2_completed. Require
the local evidence fields and substantive review; absence of Git must be checked,
not inferred from one missing directory. This does not mean integrated or released
and cannot authorize Git drift. Never initialize Git or remove metadata merely to
change which gate applies. Revisit integration through a new record if Git is added.
For executable handoff read developer-handoff.md: validate advertised commands in
a fresh process, actual preview egress/identity, and living records.

## Upgrade and recover

Version 0.6.7 (SPEC-TOOL-032) adds safe authoring/discovery diagnostics, explicit
verified-local closure, optional dependency-free command-context and coverage-
capability helpers, and focused developer-handoff recipes. No project execution,
tool installation, adoption upgrade or policy approval is automatic. Core Git
integration gates remain unchanged; capability checks qualify supplied evidence,
not correctness or complete instrumentation.

Version 0.6.6 addresses rehearsal reliability (SPEC-TOOL-030): structured partial-adoption receipts with nonzero exits, reviewed shell-free Windows verification examples, and an optional bounded fresh-process Codex skill-catalog probe. It also clarifies protected-directory permissions, nested package-manager identity, per-metric coverage gaps, owned shutdown and coordinated metadata gates. No automatic ACL repair, current-session reload, target-project upgrade or extra runtime dependency is introduced. Existing projects remain pinned until explicitly upgraded; source/package/plugin identity must match before distribution.

Version 0.6.5 integrates the reviewed unit-first and coverage guidance, covers-quality skill, optional project-local ESLint ratchet, and incomplete-evidence/redirect repairs. All eight skills and tooling remain opt-in to the applicable workflow; no target dependency or rule is installed automatically. Use a clean reviewed source commit and refresh an older personal plugin deliberately; a new agent session is required to activate newly installed skills there. Version 0.6.6 additionally offers the fresh-catalog recipe above without claiming current-session activation. Existing adopted projects keep their pinned artifacts. Default toolkit coverage includes assessment and adapter contracts; the real-ESLint integration remains explicitly opt-in, and loaded-module instrumentation does not prove an all-owned-source denominator.

Version 0.6.4 makes a unit-first initial baseline explicit, supplies a bounded baseline/meeting worksheet, and defers new E2E setup unless selected scope or existing gates require it. This changes guidance, not automated gate enforcement. Onboarding and baseline completion are not release approval. Existing adopted projects retain their pinned workflow until deliberately upgraded.

Version 0.6.3 lets the onboarding agent offer a scoped approved Windows preparation command, with identity checked before writing and manual commands as the fallback. Blocked packaged scripts can use equivalent permitted inline checks without changing execution policy.

Version 0.6.2 adds the Windows ownership diagnostic, developer preparation/repair guidance, and helper checks after Phase 0 and cold restart. It does not change ACLs or the standalone adoption CLI's enforcement. Existing projects retain their pinned guidance until an explicit upgrade.

Version 0.6.1 adds bounded approval classes, safe partial handoff, cold-process skill activation and explicit pre-source-control support. Version 0.6.0 added Codex CLI plugin bootstrap while preserving project-local, agent-portable adoption. Version 0.5.0 added a source-backed discovered current architecture deliverable, with a standalone template that can also become a reviewed wiki page. Version 0.4.0 added opt-in assessment automation: offline dependency inventory, authorization-gated OSV queries, static Docker preflight, explicit fast/full verification and evidence-hashing closeout receipts. None runs project commands, starts Docker, contacts a provider or writes evidence without the corresponding explicit option. Version 0.3.0 added optional Lite resources and advisory drift without changing the default enforced policy. Human edits no longer need an authorship exception. Version 0.2.0 introduced explicit drift selection, readiness acceptance metadata and per-page wiki source_revisions. Migrate existing artifacts deliberately; do not fabricate historical evidence.

For an upgrade pin source revision, audit the old adoption and preview the new payload in a disposable clone. Conflicts intentionally block overwrite. Preserve old manifest, project customizations and reviewed diffs; no automated merge/uninstall. Do not copy this source repository's specs or CI over the application's records. Maintain existing required gates. A rollback restores the reviewed previous toolkit and matching configuration, not unrelated app changes.
