---
name: covers-execute
description: "Implement an authorized COVERS spec with characterization protection, meaningful failing regressions and coverage-directed tests."
---

# covers-execute

For Full, verify independent spec-review evidence before affected execution and
independent implementation review before closeout, following workflows/self-critique.md.
If unavailable, report the missing checkpoint; never invent review or silently
skip it. Stage boundaries retain meaningful red/green and prerequisite evidence.

SPEC-TOOL-015/R2: Read methodology/workflows/testing.md (prefix .covers/ after adoption), plus methodology/workflows/quality.md or methodology/workflows/environments.md when those are in scope (prefix .covers/ after adoption). Run readiness for the explicitly selected spec IDs before editing; human authority and substantive acceptance remain separate.

SPEC-TOOL-019/R3: prefer spec-led implementation; both human and agent edits are allowed. Expose and reconcile direct-edit drift without fabricating prior permission. For explicitly selected Lite, read methodology/workflows/lite.md (prefix .covers/ after adoption), implement from the quick note and record actual checks/owned deferrals. Formal readiness/catalog/mappings below apply to Full, not plain quick notes.

Before acting, read the shared COVERS operating contract: in a source checkout use repository-root methodology/COVERS.md; in an adopted project use repository-root .covers/methodology/COVERS.md. If unavailable, report the missing contract rather than inventing rules. This skill is distributed with the toolkit, not as a standalone file.

Establish Ready plus real execution authorization and satisfied dependencies before editing. Protect valid existing behavior with characterization; known bugs require an observed relevant assertion failure, fix, same test passing and broader checks. For coverage gaps inspect untaken paths and write meaningful tests; existing correct behavior need not fail artificially. Use diverse contract-grounded candidate scenarios and stack-appropriate layers. Amend spec before discovered edits. Stryker only when requested in a safe bounded experiment. Record commands, coverage scope, actual results and unresolved work. Do not mark complete on unavailable verification.

Use the existing project specs/ registry and invariant catalog; do not assume personal/global skills or credentials exist. The user's scope and higher-priority instructions always bound these procedures.
