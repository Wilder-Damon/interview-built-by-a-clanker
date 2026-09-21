---
id: SPEC-ONBOARD-001
description: Onboard the Agentic Personas Storefront to COVERS for a bounded live technical assessment.
status: in_progress
domain: onboarding
sdd_mode: spec-led
parent: null
depends_on: []
amends: []
requirements:
  - id: BR1
    source: conversation:2026-09-21
    summary: Preserve repository evidence and adopt nonconflicting COVERS scaffolding before any repairs.
  - id: BR2
    source: conversation:2026-09-21
    summary: Produce a source-backed architecture, separate functional and security findings, setup receipts, and a unit-first characterization proposal.
  - id: BR3
    source: conversation:2026-09-21
    summary: Install locked dependencies safely but do not execute project checks or repair behavior without further approval.
invariants: []
key_decisions:
  - id: D1
    decision: Use the Full COVERS workflow for onboarding while keeping the first executable baseline unit-first.
    rationale: The assessment crosses frontend, API, shared contracts, authentication, authorization, and several candidate defects; formal traceability is proportionate while runtime scope remains bounded.
    alternatives: [Use a Lite quick note]
    consequences: [Maintain a formal active spec and registry, install the isolated pinned parser, keep repairs separately authorized]
  - id: D2
    decision: Retain and coexist with the existing .lore specification records.
    rationale: The .lore records concern eci.yml and contain history that COVERS must not overwrite or silently migrate.
    alternatives: [Bridge or migrate the legacy records]
    consequences: [.lore remains authoritative for its historical scope; COVERS governs this onboarding and future explicitly covered work]
  - id: D3
    decision: Treat the repository as an exercise and use a local trusted-project boundary for static onboarding and dependency installation only.
    rationale: The repository describes a debugging assessment, no application execution is authorized, and install scripts will be disabled.
    alternatives: [Containerized execution, stronger disposable isolation]
    consequences: [No services, backends, browser runs, or project checks during onboarding; revisit isolation before executing unfamiliar runtime paths]
acceptance:
  - id: R1
    description: Project-local COVERS 0.6.7 assets are adopted without overwriting pre-existing project content, with provenance and interventions recorded.
  - id: R2
    description: A concise source-backed overview and discovered current architecture describe components, flows, persistence, trust boundaries, integrations, generated code, and explicit unknowns.
  - id: R3
    description: Functional findings and security findings are separate and record evidence state independently from disposition.
  - id: R4
    description: Root AGENTS.md preserves existing governance and records COVERS scope, execution boundaries, legacy-spec disposition, and configured versus verified commands.
  - id: R5
    description: Dependency preparation records runtime and package-manager identities, source/install-script review, exact commands, outcomes, and skipped lifecycle scripts without modifying manifests or lockfiles.
  - id: R6
    description: The handoff proposes one bounded unit-first verification batch and clearly marks build, test, typecheck, lint, coverage, application, service, external advisory, CI, and release evidence as executed, deferred, failed, or unverified.
files:
  - {path: AGENTS.md, action: add, state: changed}
  - {path: specs/invariants.json, action: add, state: changed}
  - {path: specs/reviews/covers-onboarding-overview.md, action: add, state: changed}
  - {path: specs/reviews/current-architecture.md, action: add, state: changed}
  - {path: specs/reviews/functional-findings.md, action: add, state: changed}
  - {path: specs/reviews/security-findings.md, action: add, state: changed}
  - {path: specs/reviews/setup-results.md, action: add, state: changed}
  - {path: specs/reviews/first-baseline-proposal.md, action: add, state: changed}
  - {path: specs/reviews/covers-onboarding-scorecard.md, action: add, state: changed}
---

# COVERS onboarding and assessment handoff

## Authority and baseline

The user explicitly requested COVERS onboarding, nonconflicting scaffolding, locked dependency installation from public registries with lifecycle scripts disabled, and a presentation-ready assessment handoff. This authority does not include project build, test, typecheck, lint, coverage, application/service execution, external advisory queries, repairs, hooks, commits, pushes, or deployment.

Target repository: `C:/dev/eci-2nd-round` at Git revision `325f5e52f9c8e50b24b576777b73ad31da3fc414`, branch `main` tracking `origin/main`. The initial worktree was clean. Phase 0 adds project-local COVERS assets; later receipts identify resulting local changes.

## Outcome, scope, and non-goals

This onboarding establishes project-local COVERS governance and a static, source-backed technical assessment baseline. It preserves `.lore` records, application code, generated-file conventions, package manifests, lockfiles, Git metadata, and existing scripts.

No defect repair, dependency upgrade, product-intent decision, security-risk acceptance, service startup, backend contact, browser/E2E setup, or release claim is in scope.

## Requirements mapping

- BR1 maps to R1 and R4: safe adoption, project steering, and legacy-record coexistence.
- BR2 maps to R2, R3, and R6: architecture, honest finding states, and bounded handoff.
- BR3 maps to R5 and R6: dependency preparation with execution gates retained.

## Sequence and checkpoints

1. Complete and audit nonconflicting COVERS adoption.
2. Create the project-specific steering and evidence artifacts listed above.
3. Install the isolated COVERS parser and locked project dependencies only within the authorized installation boundary.
4. Generate and validate the formal registry and audit adopted bytes.
5. Stop before project checks or repairs and request approval for the bounded verification batch.

## Quality and verification gates

Onboarding metadata checks are distinct from project correctness checks. A successful COVERS audit/validate/readiness result establishes only its documented metadata or byte-integrity scope. Dependency installation establishes availability, not buildability or correctness. The first proposed executable baseline is unit-first, with focused API integration only where required to exercise authentication/ownership faithfully; browser/E2E remains deferred unless an approved repair requires it.

## Recovery and evidence

Phase 0 initially created `.covers` methodology/tooling/scaffolding and then failed with `EPERM` at `.agents/skills/covers/SKILL.md`. No partial file existed at the failed path. A same-source preview showed created files unchanged and 13 pending paths; one scoped retry under the verified developer account completed. The onboarding scorecard and setup receipt retain these facts.

This spec remains active. It will not be marked complete until required onboarding evidence is reviewed, metadata checks have actual results, and integration/closeout is separately authorized.
