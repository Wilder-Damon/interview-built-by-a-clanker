# Quick spec — restore the configured typecheck

## Outcome

The existing root `corepack.cmd pnpm typecheck` command completes with exit 0 and its intended nonempty workspace task selection. Fix the actual TypeScript diagnostic at its source without weakening compiler options, adding suppressions, changing dependency versions, or altering unrelated behavior.

## Boundaries

Task workflow: **Lite**. This is expected to be a small, reversible compiler repair with one existing deterministic gate. The user explicitly authorized reproducing and implementing the typecheck fix.

In scope: the smallest owned source edit required by the reproduced diagnostic, this quick note, and rerunning the same root typecheck. Out of scope: other onboarding findings, authentication/security policy changes, dependency upgrades, build/lint/test/browser/service execution, generated-file hand edits, commits, pushes, and deployment.

If reproduction shows broader contract ambiguity, multiple unrelated failures, or a security-sensitive change, stop and reassess/promote before editing.

## Verification

1. Run `corepack.cmd pnpm typecheck` from the repository root and retain the failing task, diagnostic, exit, and actual Turbo task count.
2. Inspect the diagnostic’s source and directly related shared contract.
3. Apply the smallest type-correct fix without `any`, `@ts-ignore`, excluded source, or weaker compiler configuration.
4. Rerun the identical root typecheck and require exit 0 with nonempty intended task selection.
5. Review the diff for behavior or scope expansion.

## Deferred work

- Build, lint, unit/integration tests, browser/E2E, and unrelated functional/security findings remain owned by `SPEC-ONBOARD-001` or a future covering record. Revisit before claiming broader correctness or release readiness. Owner: project owner.

## Results and reconciliation

Tested 2026-09-21 on the local worktree based on revision `325f5e52f9c8e50b24b576777b73ad31da3fc414`, alongside the uncommitted COVERS onboarding additions.

- Red: `corepack.cmd pnpm typecheck` exited 1. Turbo selected three packages and four tasks; three succeeded/cached. `@acme/web#typecheck` failed with `TS4023` because generated exported variable `IndexRoute` referenced the non-exported `SearchParams` interface from `apps/web/src/routes/index.tsx`.
- Fix: exported the existing `SearchParams` interface from its source route. No generated file, compiler option, dependency, or runtime behavior was intentionally changed.
- Green: the identical root typecheck exited 0 with all four intended tasks successful; three were cached and the web typecheck executed. Turbo reported 2.185 seconds.
- Diff review: the only content diff in application source is `interface SearchParams` → `export interface SearchParams`.
- Generated-file caveat: Git reports `apps/web/src/routeTree.gen.ts` modified after the command, but its worktree blob hash exactly equals `HEAD` (`0c2685a5fb57a3817ecace3ed69d0d7671889e2d`) and `git diff` contains no content change. A stat-cache refresh attempt failed because the sandbox could not write `.git/objects`; no alternate write path was used.
- Limitations: build, lint, unit/integration tests, runtime, browser behavior, and unrelated findings remain unverified. Passing typecheck proves only the selected compiler tasks at this local state.

The Lite outcome is locally verified within this narrow scope. Preserve this note for handoff; no release, commit, or deployment occurred.

User review: approved on 2026-09-21. This approval accepts the bounded typecheck repair and retained evidence only; deferred checks and delivery actions remain separately authorized.
