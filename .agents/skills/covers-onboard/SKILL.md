---
name: covers-onboard
description: "Onboard a legacy or new codebase into COVERS with guidance inventory, reviewed skills, tooling readiness and a bounded modernization plan."
---

# covers-onboard

SPEC-TOOL-019/R1-R4: setup.md offers Lite or Full for the onboarding task. Establish shared constraints and defaults, not an exclusive project mode: future tasks/features can mix both. Recommend per-task scope using workflows/lite.md. Lite reads workflows/lite.md and uses a quick note instead of requiring a master/catalog/registry. Preserve existing formal records, team rules and current gates; do not silently migrate. Apply the safety/steering/provenance checks below in both profiles; comprehensive formal onboarding and metrics can be owned deferrals in Lite.

SPEC-TOOL-015/R1-R2 and SPEC-TOOL-024/R1-R5: use the portable setup reference, not the application's README. This skill supports two modes and is language-neutral:

- **Adopted mode:** if the explicit target repository contains `.covers/methodology/COVERS.md`, use that project-pinned toolkit and its project-local steering.
- **Bootstrap mode:** if `.covers` is absent, resolve the trusted toolkit root from this installed skill's location: `SKILL.md` is under `<toolkit-root>/skills/covers-onboard/`. Verify that the resolved root contains `tooling/bootstrap.mjs`, `methodology/COVERS.md`, `methodology/setup.md`, `scaffolding/` and `package.json`. Never search arbitrary parent directories, download, clone or update COVERS implicitly. If the root cannot be verified, stop and report the missing resource.

Identify one **explicit target repository**. Prefer the repository root containing the Codex CLI working directory; verify it with read-only filesystem and Git inspection. If multiple repositories or an ambiguous non-repository directory are in scope, ask for the exact target. Never encode or reuse a target path from a previous project.

Git is recommended but optional. Use read-only filesystem/Git inspection to distinguish a repository, a positively checked pre-source-control project, and an unknown context; a missing root `.git` alone is insufficient. Continue with filesystem identity when Git evidence is unavailable, labeling uncertainty honestly. Bootstrap, specs, architecture, index, validation, audit, readiness and test planning remain available; unavailable Git revision, branch, dirty state and drift must not be invented. Never initialize Git, create a baseline commit or describe the directory as defective merely because metadata is absent unless the user separately requests source-control setup.

SPEC-TOOL-032/R2,R6: a missing root `.git` alone is not proof of no-Git context.
Read formats.md before explicit `verified_local` closure; its conservative local
readiness check and evidence requirements apply. At executable handoff read
developer-handoff.md for fresh-terminal identity and live-record reconciliation.

Before acting, read `methodology/COVERS.md` from the verified toolkit root in bootstrap mode or `.covers/methodology/COVERS.md` in adopted mode. If guidance is missing, report it; never invent permissions.

Read the complete setup sequence at `methodology/setup.md` from the verified toolkit root (bootstrap) or **`.covers/methodology/setup.md`** (adopted). For discovery read the corresponding initial-assessment.md. Read workflows/onboarding.md and workflows/environments.md from the same methodology directory; load workflows/quality.md, workflows/testing.md and workflows/stakeholders.md only when reaching those checkpoints.

## Approval discipline and safe recovery

Before tool use, present a short approval plan and batch predictable work into four classes: bounded read-only discovery; isolated COVERS parser installation when Full metadata needs it; COVERS evidence writes; and COVERS metadata verification. Request at most **one approval per class per phase**. Name the exact command, targets, write effects and exclusions. A denied request or repeated equivalent prompt ends that class for the phase; do not rephrase it into a new approval. Do not ask for broad shell access when a narrower operation is available.

Use supported tools only. If a supported edit or command helper fails, do not search for, locate or invoke an internal patch utility, switch to an undocumented substitute, or expand outside the sandbox to work around it. Make at most one materially safer retry per helper-failure class across the phase, not one per file or command. If it also fails, stop that operation and produce a **partial-onboarding handoff** using `scaffolding/onboarding-handoff.md`; if writing the handoff is blocked, render the completed and pending state in the response. Do not infer, guess or attribute the cause to skill refresh, sandboxing, antivirus or another mechanism without direct evidence—record the exact error and its observed timing. Prevent truncated instruction reads by sizing output to the selected files or reading each file in bounded consecutive portions; output pagination is not a helper-failure retry.

On Windows Codex, before Phase 0 apply read `methodology/windows-onboarding.md` (under `.covers` in adopted mode). Use its read-only ownership preflight and show the developer the exact preparation or scoped recovery commands when needed. For missing `.agents`, offer one supported approval request to create that directory as the intended developer account, verifying identity before the write and ownership afterward. If execution policy blocks the packaged script, equivalent permitted inline checks are available. Use manual developer-terminal instructions only if the approved operation cannot run; do not bypass a denied request, failed helper, or policy. Different ownership requires review, not an automatic permission reset. Keep Codex under the normal developer account; any one-time admin repair is explicit and preserves ACL rules. Immediately after Phase 0 and on cold restart, check supported-helper execution separately from skill discovery before evidence writes. Matching ownership is not proof of helper health.

Start with a fast, bounded, read-only scan: repository and revision state; apparent languages/frameworks; top-level components and runtime shape; manifests; tests, coverage, lint, type, build and CI tooling; existing steering/specs; external-service indicators; and material unknowns. Do not recursively read the whole repository or execute discovered scripts. Show the developer a concise **project overview** before any apply, covering:

- what the project appears to do and its high-level architecture;
- stack, entry points and primary commands, clearly labeled observed or unverified;
- current test/quality/security posture and obvious gaps;
- external systems, credentials or execution risks requiring a boundary decision;
- existing guidance/spec systems and the proposed reconciliation;
- a risk-based **Full or Lite** recommendation with rationale; and
- the exact Phase 0 adoption preview, including conflicts and what remains untouched.

Pause for material developer corrections or a profile choice when the evidence is ambiguous. The original explicit request to onboard permits continuing with the recommended profile when no such decision is needed. A request to inspect, explain or plan is not authority to install.

In bootstrap mode, run the dependency-free verified bootstrap with absolute paths and preview first:

```text
node <toolkit-root>/tooling/bootstrap.mjs --target <explicit-target>
```

Report the toolkit version/source identity, every create/unchanged/conflict result and the fact that preview writes nothing. This **Phase 0** exception installs immutable toolkit assets only; it does not create or edit project-specific governance. The user's explicit request to **onboard** the target authorizes applying nonconflicting COVERS scaffolding after the overview and preview are shown. Apply with `--apply`, never bypass a conflict. Continue only with this already-loaded plugin skill while treating the copied `.covers/methodology` as project-pinned authority; do not claim the newly copied skill was discovered or refreshed mid-process. Do not install target dependencies. Do not run target application code. Do not enable hooks, CI, containers, external services, credentials or network calls as part of bootstrap.

After Phase 0, record the selected workflow before any project-specific setup edit: Full uses an onboarding/master spec; Lite uses a quick spec. Reconcile existing systems first. Then create or reconcile these default evidence paths under that record:

- `specs/reviews/covers-onboarding-overview.md` — the corrected developer-facing overview, evidence states, chosen profile and open decisions.
- `specs/reviews/covers-onboarding-scorecard.md` — the **cold dry-run scorecard**, adapted from `scaffolding/dry-run-scorecard.md`, with elapsed time, interventions, failures and reusable lessons.

If an existing project record system uses different paths, retain it and record the equivalents in the governing spec/quick note. Adapt or create root `AGENTS.md` only after the governing record exists. SPEC-TOOL-030/R3-R4: for cold catalog evidence read `methodology/skill-discovery.md` (under `.covers` after adoption) and use its optional supported fresh-process probe, or fully exit the Codex process and relaunch it from the target directory. A new task inside the same process is insufficient evidence; a probe does not reload the current session. Discovery success, current-session activation and edit/command-helper health are separate observations. If closeout cannot safely finish, leave the governing record active, mark receipts pending and use the partial handoff instead of escalating around the failure.

SPEC-TOOL-030/R1,R4: matching ownership does not establish effective write permission. Protected `.agents/skills` writes may require a scoped, approved developer-account apply even when the read-only preflight passes. Read the Windows guide's partial-adoption recovery before retrying: retain created/pending/failed paths, preview the identical source snapshot, preserve partial-file conflicts and never auto-delete or overwrite. A helper failing before execution is not the same as a bootstrap I/O refusal; do not use another account to bypass a failed helper or denied operation.

SPEC-TOOL-022/R1-R3: create a source-backed discovered **current architecture** artifact during initial assessment. Cover system context, components/ownership, data and control flows, persistence, integrations, authentication/authorization and trust boundaries, runtime/deployment, build/test/observability topology and unknown scope. Label claims observed, source-confirmed, inferred, claimed-only or unknown. Keep **target architecture** and recommendations separate. Adapt `scaffolding/wiki/architecture.md` as standalone Markdown or `wiki/pages/architecture.md` with source revisions; a wiki and diagram are optional, and an untouched template is not evidence.

For dependency review, inventory exact versions from the direct and transitive locked graph using maintained ecosystem tooling. Classify public, private/internal and unknown packages. Before any external request, state the provider, exact metadata payload and privacy implications and obtain authorization; do not transmit source, lockfiles, private package names/URLs, credentials or repository identity without specific authority. Offline/local sources are valid. Record query errors and triage authoritative ranges, withdrawn status, prerequisites, platform, role, reachability and containment. A match is not automatically exploitable; no match is not security clearance. Do not auto-upgrade—write a separate covering spec and verify the locked change.

SPEC-TOOL-021/R1-R2,R5 and SPEC-TOOL-024/R4: read methodology/assessment-tooling.md from the same source/adopted root. `deps` is offline/no-write by default; output scaffolding, an OSV request and Docker execution each require separate explicit choices. Use `docker-preflight` only as static configuration evidence and retain every listed dynamic check as unverified until authorized observation. Adapt `scaffolding/dry-run-scorecard.md` at the scorecard path above; do not turn one pilot or project-specific workaround into a universal claim.

Under authorized onboarding, preview adoption, review provenance and conflicts, then apply. Adapt/create root AGENTS.md when absent after checking case variants and scoped guidance, or merge deliberately without losing existing instructions. Bootstrap supplies proposals only. Verify parser setup, registry, actual agent discovery and runtime boundary separately. Other agents may need a reviewed adapter; the initiating Codex plugin is not a team prerequisite after project-local adoption.

When planning the first executable baseline, read workflows/testing.md and adapt scaffolding/baseline.md. Recommend **unit-first** for a bounded simple-project assessment or demonstration, independently of Lite/Full. State the choice once in the overview: unit-first, or expanded integration/E2E for explicit scope, existing gates, or risk. Honor a choice already supplied; ask only when the difference materially changes scope. Onboarding alone does not authorize application execution. Do not install new browser tooling, download browsers, build server harnesses, or run new E2E by default. Keep existing required gates, record owned deferrals and revisit triggers, and distinguish onboarding completion from baseline and release readiness.

Record baseline behavior and engineering metrics with evidence states; characterize before risky changes. Before selected business-behavior repairs present the known findings together with exact candidate invariants for accountable stakeholder decisions. Keep security-risk decisions separate, and unknowns explicit. A wiki is optional derived synthesis, not approval.

Use existing tools and a per-rule quality ratchet; no automatic global packages, extensions, MCP, container mandate, source uploads or real backend calls. Missing metrics are not zero. Report completed setup, interventions, verified commands and remaining gaps. Follow setup.md for cold handoff, selected-spec drift, lifecycle and upgrades.
