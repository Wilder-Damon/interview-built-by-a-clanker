# Recommended team delivery baseline

SPEC-TOOL-015/R2: preserved workflow guidance, extracted from the former full operating contract. Read the short COVERS.md contract first; higher-priority authority is unchanged. Paths in this reference are repository-root paths in the source distribution; prefix .covers/ after adoption unless already specified.

## Optional agent-tool hooks

Skills guide judgment; reviewed deterministic command hooks can enforce specific checks at supported agent execution points. Keep three layers distinct: agent-tool hooks intercept supported agent actions, Git hooks check local repository events, and CI/merge controls govern integration. None is automatically installed by COVERS. Reuse existing controls and choose a hook only for a demonstrated project need.

Before enabling a hook, specify its owner, pinned agent/version and event coverage, permitted inputs/actions, blocking versus advisory result, timeout/error behavior, cost and recovery path. Review the executable code and configuration like other privileged tooling. Use narrow deterministic predicates for deterministic enforcement; LLM prompt/agent hooks remain probabilistic review, not deterministic policy engines. Do not execute untrusted payloads as shell text, log secrets, upload source or broaden permissions.

Prove the configured boundary with allowed and rejected cases, malformed input, runner failure, timeouts, alternate tools and out-of-band edits. Confirm the actual agent's blocking semantics: post-action or asynchronous checks may observe damage without preventing it. A hook is not a sandbox or a universal interception layer. Document bypass paths and a separately authorized, auditable emergency override with reconciliation; do not teach the agent to disable its own guardrails after failure. Required CI checks repeat substantive controls independently, with protected configuration and separately verified merge enforcement.

Use project-native equivalents. [Claude Code's official hooks reference](https://code.claude.com/docs/en/hooks), reviewed 2026-09-20, illustrates event-specific controls; support and configuration are agent/version-specific, not portable by filename. This is optional design guidance, not a supplied or activated COVERS agent-hook adapter.

## Recommended team delivery baseline

Before closeout follow workflows/self-critique.md: Full needs independent spec
and implementation-review evidence, substantive finding closure, and reconciliation
of living steering, exact invariant decisions, findings and command receipts.
CI success alone does not satisfy these obligations. Lite deferrals require owners
and triggers; requested review needs requester-authorized deferral if unavailable.
Keep completed history intact and assess new findings against current acceptance.

SPEC-TOOL-019/R2-R4: Lite is a local working-code profile, not release authorization. Teams may explicitly choose `drift --base REF --policy report` for advisory visibility; display unmapped changes and warnings to reviewers. A zero exit means report produced, not compliant. Errors remain nonzero. Existing enforced drift, tests/security gates and protected branches remain unchanged. Human edits are allowed in either profile; reconcile drift before promotion and resolve required deferrals or obtain a genuine authorized exception. Read workflows/lite.md for urgent containment and quick-note retention.

Recommend Husky for compatible JS/TS repositories or an existing/stack-appropriate equivalent (pre-commit, Lefthook, native Git hooks). Do not replace a working hook manager merely to adopt COVERS. Pin/review any new dependency under the setup spec. Hooks are optional, fast and non-mutating; never silently regenerate/stage files. CI repeats required checks independently.

Use trunk-based development: one protected integration branch, small short-lived branches, frequent reviewed PRs, and feature flags for incomplete capabilities when appropriate. Keep trunk releasable; use rollback or revert plans rather than long-lived divergent development branches. Existing team governance takes precedence until migration is explicitly agreed.

Optional pre-commit hooks provide fast local metadata feedback and are bypassable. Review and integrate scaffolding/pre-commit into the existing hook manager; never silently set core.hooksPath or replace hooks. CI is the authoritative merge gate: clean dependency setup, metadata/registry validation, drift against the target merge-base, project tests, coverage and appropriate security/type/lint/build checks. Protect CI and methodology files through normal review ownership. The supplied CI example is not activated or full branch protection.

The default drift command checks branch, index and working-tree layers against explicitly selected ready/in_progress specs that pass readiness; completed scopes cannot cover changes. Directory scopes retain their declared action; rename records need both exact endpoints. See formats.md for snapshot consistency, modes and prerequisite evidence. Keep implementation specs active through the implementation PR. Close verified specs and update evidence in a subsequent metadata-only PR after merge. This deliberately avoids allowing any historical completed spec to authorize new edits. Reviewing metadata changes is a human requirement: exempting specs/ from path coverage is not permission to weaken them or store production scripts there.

Separate deployment from PR validation: promote reviewed immutable artifacts from trusted trunk using least privilege, environment approval where appropriate, observable health checks and rollback. No deployment credentials are available to untrusted PRs. Adapt the CI example to GitLab or other providers; do not assume GitHub-only teams.

## Verified local handoff — SPEC-TOOL-032/R2,R6

In a deliberately non-Git project, `verified_local` is a separate explicit
terminal state with reviewed local evidence and integration unavailable. Use
formats.md's `readiness --phase local` gate, not `--phase complete`. Archive may
retain the local state; it never promotes it. Git projects keep the integration
requirement, and local prerequisite evidence cannot authorize Git drift.
Read developer-handoff.md when handing over executable commands or a preview:
check a fresh terminal, actual network boundary, owned shutdown and live records.
