# Functional findings

Governing spec: `SPEC-ONBOARD-001`  
Scope: static inspection at revision `325f5e52f9c8e50b24b576777b73ad31da3fc414`  
Evidence and disposition are intentionally separate. UI repairs governed by `specs/quick/ui-bug-fixes.md` were approved on 2026-09-21; items outside that note remain proposed.

| ID | Finding and source | Evidence | Disposition | Lowest faithful characterization |
|---|---|---|---|---|
| FUNC-001 | `db.personas.search` applies `price <= minPrice`, reversing the lower-bound contract (`apps/api/src/db.ts:364-366`). | Observed | Proposed | Pure unit test for below/equal/above bounds |
| FUNC-002 | Persona cards multiplied the stored monthly price by 100 (`apps/web/src/components/PersonaCard.tsx`; `apps/web/src/components/ui-regressions.test.tsx`). | Reproduced | Resolved | Component regression passed; browser rendering remains unverified |
| FUNC-003 | Persona detail favorite toggling used the add/remove operations in reverse (`apps/web/src/routes/personas/$personaId.tsx`; `apps/web/src/routes/ui-route-regressions.test.tsx`). | Reproduced | Resolved | Mutation contract regression passed; browser interaction remains unverified |
| FUNC-004 | Checkout stores an order but never clears the user's cart (`apps/api/src/routes/checkout.ts:40-52`). Intended post-checkout behavior is unstated. | Suspected | Proposed | Stakeholder decision, then Fastify injection assertion |
| FUNC-005 | Login omitted the username required by the UI-facing auth response (`apps/api/src/routes/auth.ts`; `apps/api/src/routes/ui-contracts.test.ts`). | Reproduced | Resolved | Fastify injection contract regression passed |
| FUNC-006 | Logout retained `auth_token` in `localStorage` (`apps/web/src/lib/auth.tsx`; `apps/web/src/components/ui-regressions.test.tsx`). | Reproduced | Resolved | Auth-provider transition regression passed |
| FUNC-007 | Browse query identity omitted effective search/filter parameters (`apps/web/src/routes/index.tsx`; `apps/web/src/routes/ui-route-regressions.test.tsx`). | Reproduced | Resolved | Route query contract regression passed |
| FUNC-008 | Header and cart consumers used incompatible, non-user-scoped cache keys (`apps/web/src/routes/__root.tsx`; `apps/web/src/routes/cart.tsx`; `apps/web/src/routes/checkout.tsx`; `apps/web/src/routes/ui-route-regressions.test.tsx`). | Reproduced | Resolved | Root/cart/checkout query identity regression passed |
| FUNC-009 | CORS omitted DELETE used by cart/favorite UI requests (`apps/api/src/index.ts`; `apps/api/src/routes/ui-contracts.test.ts`). Browser preflight impact remains unverified. | Observed | Resolved | Static configuration regression passed; browser-faithful CORS verification deferred |
| FUNC-010 | Quantity decrement remained enabled at one and could submit zero (`apps/web/src/components/CartItem.tsx`; `apps/web/src/components/ui-regressions.test.tsx`). | Reproduced | Resolved | Component boundary regression passed |
| FUNC-011 | Anonymous persona detail requested the protected favorites endpoint, and favorite cache identity was not user-scoped (`apps/web/src/routes/personas/$personaId.tsx`; `apps/web/src/routes/favorites.tsx`; `apps/web/src/routes/ui-route-regressions.test.tsx`). | Reproduced | Resolved | Anonymous-disable and cross-page user-key regressions passed |
| FUNC-012 | Persona detail and Favorites routes shared a user-scoped query key but cached incompatible data shapes, and the rendered heart had no accessible action name (`apps/web/src/routes/personas/$personaId.tsx`; `apps/web/src/routes/favorites.tsx`; `apps/web/src/routes/ui-route-regressions.test.tsx`). | Reproduced | Resolved | Raw cache-shape plus rendered add/remove heart regressions passed; browser behavior remains unverified |
| QUAL-001 | Root `lint` formerly delegated to Turborepo with zero effective lint tasks. It now runs an ESLint no-new-debt ratchet over 33 owned TS/TSX files (`eslint-ratchet.json`; `specs/quality/eslint-ratchet-review.md`). | Reproduced | Resolved | Ratchet pass/failure and fail-closed challenges completed; CI enforcement remains absent |
| QUAL-002 | The repository had no tests, test script, coverage configuration, or CI file at onboarding. A focused Vitest unit/contract layer now covers the approved UI repair, but no coverage target or CI gate exists. | Observed | Deferred | Expand the baseline and add a measured ratchet under separate approval |

`SEC-001` through `SEC-007` are maintained separately in `security-findings.md`; security-risk disposition cannot be inferred from this product findings list.
