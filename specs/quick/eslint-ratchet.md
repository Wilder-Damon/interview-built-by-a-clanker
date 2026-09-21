# Quick spec — introduce an ESLint no-new-debt ratchet

## Outcome

Replace the ineffective root lint wrapper with a project-local ESLint gate that measures owned TypeScript/TSX, preserves reviewed existing diagnostics as visible debt, and fails for new diagnostic identities or multiplicity increases. The gate must fail closed for missing tooling, empty scope, incompatible identity, fatal configuration/parser results, and attempted inline suppression.

Workflow: **Lite**. This is a reversible developer-tooling change with bounded source scope and no intended application behavior change. The user explicitly selected the ratchet approach and previously authorized required project-local package installation.

## Boundaries

In scope:

- Exact project-local ESLint, `@eslint/js`, and `typescript-eslint` dependencies compatible with Node 22 and the installed TypeScript toolchain.
- A reviewed flat configuration using recommended JavaScript and TypeScript syntax rules plus observational complexity and parameter-count warnings.
- The adopted COVERS ESLint adapter, project-owned settings, retained candidate/reviewed baseline, root report/check commands, evidence review, and disposable gate challenges.
- Owned API, web, shared source, and focused test files. `apps/web/src/routeTree.gen.ts` is generated and excluded; dependencies, build output, coverage, COVERS payload, and agent skills are excluded.
- Guidance/setup/findings reconciliation and preservation of the existing test/typecheck gates.

Out of scope: autofixes, formatting churn, application behavior repair, type-aware ESLint rules, coverage/complexity refactors, hooks, CI, editor/global tools, services, browser/E2E, commits, pushes, and deployments.

## Verification

1. Record the old root lint command's actual task count; zero effective lint tasks is not a pass.
2. Install exact public-registry dependencies with the pinned package manager, lifecycle scripts and audit disabled; preserve lockfile consistency.
3. Finalize configuration, settings, identity inputs, and developer commands before capture. Run report-only measurement and retain its exit and diagnostic counts.
4. Capture a candidate, review all diagnostic identities/multiplicities and false-positive risk, then explicitly retain a reviewed baseline without changing source or suppressing diagnostics.
5. Run the no-new-debt developer command and require a nonempty measured file set.
6. Challenge known pass, new violation, resolved/reintroduced allowed debt, missing analyzer, empty target scope, and incompatible configuration/identity. Preserve exits; disposable challenge files must not remain.
7. Rerun focused tests and root typecheck. Attempt the configured build but preserve the existing host `node:os.userInfo()` limitation if it recurs.
8. Review manifest, lockfile, configuration, baseline, generated-file, and source diffs. Passing lint proves only the reviewed static-rule scope.

## Ratchet policy and deferrals

- Existing baseline diagnostics remain debt, not approved code quality or behavior. Baseline replacement/tightening requires separate review; the check never refreshes it.
- New files and changed contexts are measured. Distinct diagnostics cannot offset each other; multiplicity is enforced.
- Type-aware rules, complexity cleanup, zero-warning enforcement, coverage, CI enforcement, and broader metrics are deferred to the project owner before release/promotion or the next quality-hardening task.
- Independent critique is proportionately deferred for this Lite task; command challenges and diff review are required instead.

## Results

- Dependency preparation: exact `eslint@10.10.0`, `@eslint/js@10.0.1`, and `typescript-eslint@8.70.0` were added from the public registry with lifecycle scripts and audit disabled. The add updated the manifest/lockfile and warned that the existing `node_modules` needed relinking; the follow-up frozen, script-disabled install succeeded. No lifecycle scripts ran.
- Prior command: the original `corepack.cmd pnpm lint` exited 0 but executed zero lint tasks; its only Turbo task was a cached shared-package build. It was not verification.
- Report-only baseline: `corepack.cmd pnpm lint:report` measured 33 owned TS/TSX files and exited 1 for 4 existing diagnostics: 2 unused-symbol errors and 2 complexity warnings. The generated route tree was excluded; no selected target was empty or ignored.
- Reviewed baseline: `specs/quality/eslint-candidate-2026-09-21.json` was retained and reviewed, then copied unchanged to `specs/quality/eslint-reviewed.json`; both SHA-256 hashes are `8fa373720daf88922ed4eac814a5ea7164668e7cbea59d686c22719b5897ecd5`. The four allowances remain visible debt and no source repair or suppression was made.
- Ratchet check: `corepack.cmd pnpm lint` measured the same 33 files and passed with no added or resolved diagnostics.
- Challenges: a disposable new unused variable produced adapter exit 1; removing one allowed unused variable passed and reported it resolved; restoring the exact diagnostic passed, confirming the documented retained allowance. Disposable missing-analyzer, empty-target, and incompatible-config/identity checks each returned adapter JSON exit 2 and a nonzero process result. All challenge files were removed and source restored.
- Broader gates: final `corepack.cmd pnpm lint` passed with 33/33 files measured and no added/resolved diagnostics; `corepack.cmd pnpm test` passed 3/3 files and 10/10 tests; `corepack.cmd pnpm typecheck` passed 4/4 Turbo tasks. `corepack.cmd pnpm build` again failed before web compilation on the previously reproduced host-level `uv_os_get_passwd ... ENOMEM`; this remains a failed/deferred build gate, not a lint regression or pass. Final diff results are recorded in `specs/quality/eslint-ratchet-review.md`.

No autofix, behavior repair, service, browser, backend, hook, CI change, global tool, commit, push, or deployment was used.
