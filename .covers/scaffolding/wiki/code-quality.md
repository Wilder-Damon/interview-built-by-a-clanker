---
id: KN-QUALITY
title: Code quality baseline and improvement
kind: evidence
review_state: draft
sources: [SRC-QUALITY-BASELINE]
source_revisions: {} # SPEC-TOOL-014/R3: fill only after page review; missing means unverified.
related: []
specs: []
invariants: []
---
# Code quality: baseline, current evidence and ratchet

Template only. Adapt under a covering spec; add real source IDs/revisions/hashes and citations before creating wiki/pages/code-quality.md. Do not install this page as evidence automatically. Applies to any project; unsupported measures need an explicit reason. Existing team reports can serve the same purpose without a wiki.

## Evidence boundary

Record revision/local changes, date, components/languages, tool versions/config, environment and raw-report links. Separate fresh runs from historical receipts. State eligible/measured populations, generated/vendor exclusions and access restrictions.

## Baseline and comparison

| Measure | Baseline evidence/value | Current evidence/value | Change / comparable? | Interpretation |
|---|---|---|---|---|
| Cyclomatic complexity | Not collected | Not collected | Not comparable yet | Function population, median/p95/max and hotspots |
| Cognitive complexity / nesting if supported | Not collected | Not collected | Not comparable yet | Tool-defined; not interchangeable with cyclomatic |
| Function/module size, parameters, source LOC | Not collected | Not collected | Not comparable yet | Units, scope and population changes |
| Duplication | Not collected | Not collected | Not comparable yet | Duplicated/eligible lines or tokens, detector settings and locations |
| Dependency cycles / coupling | Not collected | Not collected | Not comparable yet | Internal graph, fan-in/out and unresolved/external boundary |
| Code coverage | Not collected | Not collected | Not comparable yet | Each supported metric, numerator/denominator and instrumentation scope |
| Tests / build / lint / compiler or types | Not collected | Not collected | Not comparable yet | Configured versus observed pass/fail and critical workflow coverage |

Replace cells only from cited reports. No after-improvement value until a later run. Compare matched sources separately when additions/removals/renames change totals. Tool/config/scope changes need authorized remeasurement or a non-comparable label; preserve earlier receipts.

## Hotspots and missing evidence

List named functions/modules and why they matter, with evidence/spec links. Metrics do not automatically confirm defects or authorize refactors. Explain missing tools, parse failures, unmeasured code and limitations. No overall score may conceal a required failed check.

Reconcile analyzer populations and semantics before enforcement: compiler AST and lexical function counts may differ, destructuring may confuse parameter counts, and embedded-language segments may inflate a duplication denominator. Equal counts alone do not prove equivalent entities. Exercise known-output fixtures for the project's constructs; preserve false positives and unmeasured boundaries rather than silently correcting raw reports.

## Quality ratchet

| Rule/component | Evidence and policy version | Stage | Threshold/budget | Owner / promotion trigger | Exceptions / revisit |
|---|---|---|---|---|---|
| <adapt> | <baseline and config reference> | Report-only until explicitly promoted | Not adopted | Unassigned | None approved |

Stages: observe/report-only -> reviewed baseline -> no new violations -> improve touched code -> full agreed enforcement. Separate debt, observational warnings, enforced violations and measurement errors. Record actual local/CI results and verified merge enforcement. Editor integrations are optional. Preserve required checks; review any policy weakening or baseline reset.

## Next scoped work

Link selected investigation/repair/hardening specs and actual authority. Business decisions and accepted rules remain in canonical records. Refresh derived pages after evidence/decisions change; never manufacture green measurements or approvals.
