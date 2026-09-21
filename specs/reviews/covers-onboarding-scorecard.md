# COVERS cold dry-run scorecard

Method/toolkit: COVERS 0.6.7, source `78bb5729bc628f9eadefc01ec6d24c9d9f4bfd35` clean per adoption manifest  
Target: `325f5e52f9c8e50b24b576777b73ad31da3fc414`, Full onboarding  
Participant: Codex live session; prior project knowledge not used  
Elapsed: approximately 10 minutes from initial repository timestamp/scan to evidence drafting; active time not independently measured  
Boundary: static discovery, COVERS evidence writes, isolated parser install, frozen project install; no project execution or external advisory query

## Outcomes

| Checkpoint | Evidence and observed result | Manual interventions | Friction/failure |
|---|---|---:|---|
| Cold onboarding | Bootstrap previewed 82 creates/no conflicts; final apply complete | 2 scoped approvals | Packaged preflight blocked by execution policy; first sandbox apply partially failed with EPERM |
| Assessment | Source-backed overview, architecture, functional/security registers created | 0 | Runtime evidence intentionally absent |
| Bounded change | Not in onboarding scope | 0 | Deferred pending behavior/spec approval |
| Fast verification | Not executed | 0 | Pending user approval |
| Full verification | Not executed | 0 | No tests/coverage/CI found; browser/service scope deferred |
| Closeout/handoff | Project-local guidance and next batch prepared | 0 | Fresh-process catalog probe failed before initialization; activation pending normal restart |

## Counts and interpretation

- Downloads: zero project packages downloaded; 206 reused from cache. COVERS parser added one package (network/cache source not independently distinguished by npm output).
- Privilege prompts: two narrowly scoped developer-account approvals (`.agents` preparation and Phase 0 retry). No administrator repair or ACL change.
- Failed attempts: two retained—packaged PowerShell preflight blocked before execution, and sandbox bootstrap apply stopped at one EPERM after 68 creates.
- Project tests/build/type/lint/coverage: zero executed, not passes.
- Offline dependency inventory: 306 package-version records, conservative classification unknown.
- Parent manager identity: declared and executed pnpm 9.15.0 through Corepack. Nested task identity/path preservation remains unverified because no project task ran.
- Coverage counts and unimported-source challenge: unavailable; no reporter or tests.
- Advertised stop/listener cleanup: unverified; no service started.
- Registry coordination: index passed with one spec; validate passed with zero errors; adoption audit reported all payload bytes unchanged; execute-readiness passed for `SPEC-ONBOARD-001` within metadata-only limitations.
- Fresh catalog: optional probe exited 1 before initialization with category `unknown`; child closed cleanly. Cause and current-session activation remain unverified.

## Reusable lessons

| Finding | Scope | Proposed change | Owner/priority | Verification next run |
|---|---|---|---|---|
| Execution policy can block packaged preflight | Host-specific | Continue documenting the supported inline read-only equivalent | COVERS maintainers / medium | Fresh Windows cold run |
| Developer-owned `.agents` can still reject sandbox writes | Host/tool boundary | Preserve partial receipt and use one scoped developer retry as documented | COVERS maintainers / high | Same-source preview then clean retry |
| Dependency installation with scripts disabled may leave runtime uncertainty | Project-specific | Make skipped-script impact explicit in the first verification batch | Project owner / high | Typecheck/build outputs |

This scorecard does not establish target-project release readiness or universal methodology performance.
