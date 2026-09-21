# COVERS toolkit directory

Source inventory for the future website directory. This is not a claim that the
installed plugin cache or any adopted project has been upgraded. Discover local
skills after installation; preserve pinned project authority over newer source.

## Skills

| Skill | Use |
|---|---|
| covers | Choose and coordinate the bounded workflow |
| covers-onboard | Discover, preview adoption, reconcile steering and verify setup |
| covers-spec | Requirements, scope, acceptance, invariants and decisions |
| covers-execute | Authorized implementation and red/green regression protection |
| covers-self-critique | Independent review, finding dispositions and re-review |
| covers-verify | Metadata, scoped change accountability and actual acceptance evidence |
| covers-knowledge | Source-backed wiki synthesis and per-page freshness |
| covers-quality | Project-native quality baselines, diagnostics and ratchet verification |

Source: skills/<name>/SKILL.md; adopted: .agents/skills/<name>/SKILL.md.
The private COVERS Codex plugin packages these skills; project adoption also copies
methodology, tooling and templates into .covers. Other agents need supported
discovery/steering adapters; automatic discovery is not universal.

## Tooling and templates

- tooling/bootstrap.mjs: dependency-free reviewed adoption entry point.
- tooling/adoption.mjs: source identity, non-overwriting copy plan and hash audit.
- tooling/cli.mjs and core.mjs: registry/index/validation/readiness, scope drift,
  archive/search and adoption commands; see setup.md and formats.md for invocation.
- tooling/knowledge.mjs: local wiki provenance/freshness checks, not semantic proof.
- tooling/assessment.mjs: inventory/advisory boundaries, declared Compose posture,
  explicit verification plans and evidence receipts; see assessment-tooling.md.
- tooling/windows-onboarding-preflight.ps1: bounded Windows onboarding checks;
  see windows-onboarding.md before invocation.
- tooling/skill-discovery.mjs: optional fresh Codex catalog probe without a model
  turn; see skill-discovery.md. Exact repository-path discovery is separate from
  current-session activation, helper health and full adoption audit. SPEC-TOOL-030/R3.
- tooling/eslint-ratchet.mjs: optional project-local ESLint diagnostic ratchet;
  see eslint-adapter.md and scaffolding/eslint-ratchet.json plus the optional
  eslint-typescript.config.mjs example. SPEC-TOOL-027/R1-R4; no automatic activation,
  dependency installation, source fixes or baseline acceptance.
- scaffolding/: spec/quick-note, baseline, assessment, stakeholder/security,
  authentication and quality reviews, wiki, verification/closeout and CI/hook
  examples. Templates are proposals, not project evidence or automatic installs.

Core optional CLI runtime: Node and the pinned YAML parser; Git is needed for
Git-based drift, not for Markdown-first onboarding. Stack-native test/coverage/
lint tools, Playwright, mutation tools such as Stryker, Docker equivalents, hooks
and editor integrations are optional reviewed project choices. No mandatory MCP
server, hosted account, global extension or universal analyzer is installed.

## Copyable onboarding prompt

Prerequisite: obtain the private distribution with authorized access, follow
setup.md (and windows-onboarding.md on Windows), and confirm covers-onboard is
available. Open the agent in the intended project folder; do not change repository
visibility or fetch an unapproved remote to make this prompt work.

```text
$covers-onboard Onboard this project to COVERS.
Start with a read-only overview of architecture, technologies, existing guidance,
tests, quality checks and important unknowns. Recommend a proportionate plan.
Preserve existing work, specs and tools; support projects without Git.
Batch predictable approvals within explicit boundaries. Ask before installing
dependencies or making setup changes. Do not start services, contact application
backends or fix bugs yet. Prefer a unit-first baseline where appropriate and defer
new E2E infrastructure until needed. End with deliverables, gaps and one next step.
```

Expect scoped approvals for setup, dependency acquisition and later runtime work.
Approve classes of known work, not blanket privileges. Follow the documented cold
restart/discovery checkpoint where needed. No installer or skill grants authority.
