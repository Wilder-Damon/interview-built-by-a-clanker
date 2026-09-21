# Installation and setup results

Governing spec: `SPEC-ONBOARD-001`  
Environment: local Windows developer host; onboarding setup plus the later approved typecheck and UI quick specs are reconciled below

## Runtime and package-manager discovery

| Item | State | Result / limitation |
|---|---|---|
| Git repository | Executed / observed | Root `C:/dev/eci-2nd-round`; `main...origin/main`; revision `325f5e...`; initially clean |
| Node | Executed / passed | `v22.23.2`, satisfying COVERS Node >=22 |
| Declared manager | Observed | Root `packageManager` is `pnpm@9.15.0`; no nested package declares another manager |
| Resolved manager | Executed / passed | `corepack.cmd pnpm --version` → `9.15.0`; `pnpm.cmd` was not directly present on PATH |
| Registry configuration | Executed / observed | `https://registry.npmjs.org/`; no project/parent `.npmrc` found in the inspected paths |
| Nested task identity | Deferred | No project task was authorized; verify child lookup before relying on task-runner execution |

## COVERS adoption

| Command/check | State | Actual result |
|---|---|---|
| Installed toolkit validation | Executed / passed | Required 0.6.7 files present; adopted source commit `78bb572...`, clean per `adoption.json` |
| Windows packaged preflight | Executed / failed | PowerShell execution policy blocked the `.ps1`; policy was not changed |
| Equivalent inline preflight | Executed / observed | Helper identity was `CodexSandboxOffline`; local developer ownership was verified; no reparse ancestors; `.agents` absent |
| Developer preparation | Executed / passed | Scoped approved command verified the same local developer account, created `.agents`, and reverified ownership |
| Bootstrap preview | Executed / passed | 82 create entries, zero conflicts, no writes |
| First bootstrap apply | Executed / failed partial | 68 `.covers` files created; `EPERM` at `.agents/skills/covers/SKILL.md`; 13 pending; no partial failed file |
| Same-source preview | Executed / passed | 68 unchanged, 13 create; no conflicts |
| Scoped developer retry | Executed / passed | Remaining skills/package/adoption files created; apply complete |
| Post-apply helper | Executed / passed | `Get-Location` returned repository root |
| Fresh-process skill catalog probe | Executed / failed | Native Codex path inspected; probe exited 1 before initialization, category `unknown`, 0 stdout bytes/134 stderr bytes, child closed cleanly; no cause inferred |
| Current-session activation | Deferred | Probe cannot reload this session; verify after a normal full restart from the repository |

## Dependency preparation

| Command | State | Result / limitations |
|---|---|---|
| `npm.cmd ci --ignore-scripts --no-audit --prefix .covers` | Executed / passed | Added one pinned package (`yaml` graph); lifecycle scripts and audit disabled |
| `corepack.cmd pnpm install --frozen-lockfile --ignore-scripts --config.audit=false` | Executed / passed | Four workspace projects; lockfile current; 206 packages added from cache; zero downloaded; lifecycle scripts and audit disabled |
| Manifest/lock diff | Executed / passed | No changes to project or COVERS manifests/lockfiles |
| `node .covers/tooling/cli.mjs deps --target .` | Executed / passed for offline inventory | 306 exact npm package-version records; classifications remain unknown; no external query |
| Exact UI-test dev-dependency add | Executed / failed before writes, then passed | Initial add detected a pnpm store mismatch. The retry used the existing user store and added exact `vitest@3.2.4`, `jsdom@26.1.0`, and `@testing-library/react@16.3.0` with lifecycle scripts/audit disabled; project manifest and lockfile changed as authorized. |
| Frozen relink after test-tool add | Executed / passed | Existing store, frozen lockfile, lifecycle scripts and audit disabled; lockfile was current and no scripts ran. |
| Exact lint-tool dev-dependency add | Executed / passed | Added exact `eslint@10.10.0`, `@eslint/js@10.0.1`, and `typescript-eslint@8.70.0` with lifecycle scripts/audit disabled; manifest and lockfile updated. |
| Frozen relink after lint-tool add | Executed / passed | Existing store, frozen lockfile, lifecycle scripts and audit disabled; installed graph linked successfully and no scripts ran. |

Skipped lifecycle scripts may affect later native/binary validation or generated setup; successful installation is not build verification. The pnpm update notice was declined: no package manager or dependency was upgraded. No global setting/tool changed.

## Project command state after approved quick specs

- Tests: `corepack.cmd pnpm test` is configured; the UI repair recorded a clean 10-failure red baseline followed by green, and the authorization repair recorded 2/2 meaningful failures followed by green. The latest combined run passed 4/4 files and 12/12 tests.
- Typecheck: executed and passed 4/4 Turbo tasks after the typecheck and UI repairs.
- Build: executed twice after the UI repair and failed before web compilation on the host-level Node `os.userInfo()` ENOMEM; a standalone diagnostic reproduced it. This remains deferred, not passed.
- Lint: `corepack.cmd pnpm lint` runs the reviewed no-new-debt ratchet. The baseline covers 33 owned TS/TSX files; the latest run automatically included the new security regression for 34 measured files. Initial reviewed debt remains 4 diagnostics, and the check passes only when no new identity/multiplicity appears. Gate challenges are recorded in `specs/quality/eslint-ratchet-review.md`.
- Root dev and clean remain unexecuted.
- Coverage remains unconfigured.
- CI: not discovered.
- Application/service/backend/browser/E2E/advisory queries: deferred by boundary.

## COVERS metadata verification

| Command | State | Result / limitation |
|---|---|---|
| `node .covers/tooling/cli.mjs index --target .` | Executed / passed | One spec indexed; registry generated |
| `node .covers/tooling/cli.mjs validate --target .` | Executed / passed | One spec, zero structural errors |
| `node .covers/tooling/cli.mjs audit --target .` | Executed / passed | All adopted payload paths reported unchanged |
| `node .covers/tooling/cli.mjs readiness --target . --spec SPEC-ONBOARD-001` | Executed / passed | Spec eligible for execute phase by declared metadata only; does not verify semantics, evidence freshness, or approval |
