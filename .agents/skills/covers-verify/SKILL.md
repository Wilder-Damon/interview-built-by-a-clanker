---
name: covers-verify
description: "Verify COVERS spec metadata, invariant links, change accountability and actual project acceptance evidence without treating checks as proof."
---

# covers-verify

Read workflows/self-critique.md under the resolved methodology root. Check actual
required independent review evidence and finding closure, not just ratings.
Reconcile live AGENTS.md, findings, invariant decisions and receipts without
rewriting completed history. Check requirement-to-acceptance mappings and new
defects' impact on completion; out-of-scope does not mean non-blocking.

SPEC-TOOL-019/R1-R4: for Lite read methodology/workflows/lite.md (prefix .covers/ after adoption), check the quick note against actual diff/results and account for deferrals. Optional --policy report exposes unmapped changes without failing on them; incomplete checks remain errors. A zero exit is not compliance. No formal validate/readiness is required for a plain quick note; the formal instructions below apply to Full. Never silently change existing hook/CI policy.

SPEC-TOOL-015/R2: Read methodology/formats.md and methodology/workflows/delivery.md (prefix .covers/ after adoption). Run readiness with explicit --spec IDs. In Git projects run typed drift: use --mode local for all local layers, index for the next commit, branch in clean CI. Without Git, report drift unavailable and use the explicit local-readiness branch below only after a positive no-Git check. Unknown context cannot establish local closure. Record snapshot mismatches, not a pass. Completion readiness requires evidence references but cannot certify their truth.

SPEC-TOOL-032/R2,R5,R6: `readiness --phase local` is a separate no-Git closure
gate, not the Git `drift --mode local` option. Read formats.md before recording
verified_local; it cannot substitute for integration. For executable handoffs
read developer-handoff.md, and qualify coverage using actual raw per-metric
populations; optional capability assessment is described in assessment-tooling.md.

When requirements sources are recorded, trace each relevant source to spec acceptance and actual evidence. Compare only authorized accessible source content; report covered, partial, conflicting or unverified separately from passing metadata. Missing access is a limitation, not a pass. Never automatically fetch arbitrary locators or install connectors.

Under the default drift policy, implementation specs remain ready/in_progress through the integration PR. Record passing evidence, merge under team authority, then complete/archive in an evidence-only follow-up. Do not claim the whole spec complete before the required integration gate or use historical completed scopes to approve new changes.

Before acting, read the shared COVERS operating contract: in a source checkout use repository-root methodology/COVERS.md; in an adopted project use repository-root .covers/methodology/COVERS.md. If unavailable, report the missing contract rather than inventing rules. This skill is distributed with the toolkit, not as a standalone file.

Run validate; in Git projects inspect drift against the intended Git integration base, including local/untracked work. In positively checked no-Git projects review the identified filesystem snapshot and local evidence instead; do not fabricate a base or integration. Do not automatically run uninspected project commands from specs. Execute authorized stack-specific acceptance checks and critical workflows; distinguish metadata, unmapped changes, behavioral failures and unknown evidence. Review weakening of tests/rules/thresholds. Reconcile planned/actual files, invariant evidence and registry. Completion needs all required evidence; blocked checks stay explicit. Registry generation is an explicit write, not a silent part of read-only review.

SPEC-TOOL-021/R3-R5: read methodology/assessment-tooling.md. `verify` is plan-only unless the user/team explicitly selects `--run`; review direct executable/argument arrays as code and keep fast/full profiles distinct. `receipt` hashes declared evidence but does not run checks or validate truth; failed remains failed and blocked/not-run remains incomplete. Use the cold-run scorecard during independent handoff and preserve diagnostic friction instead of editing it away.

Use the existing project specs/ registry and invariant catalog; do not assume personal/global skills or credentials exist. The user's scope and higher-priority instructions always bound these procedures.
