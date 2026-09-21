---
name: covers-quality
description: Assess and introduce project-native lint, type/static analysis, code metrics and quality ratchets in COVERS; review existing debt and verify gates without silently approving repairs.
---

# covers-quality

Read the operating contract and workflows/quality.md under repository methodology/
or adopted .covers/methodology/. Read workflows/testing.md for test commands or
performance checks; workflows/lite.md for Lite. Use scaffolding/quality-review.md
(under .covers/ after adoption) for evidence, not a prefilled passing report.

Check what existing commands actually execute: included files/packages, effective
configuration, analyzer versions, exclusions, cached tasks and exits. A green
wrapper with zero lint tasks is not lint coverage. Reuse language/framework tooling;
mixed-language projects may need several analyzers. Assessment does not authorize
installation, autofixes or edits.

Under authorized intent, introduce report-only measurement, a reviewed baseline,
then a no-new-debt ratchet and incremental tightening. Preserve original reports;
compare stable diagnostic identities with multiplicity, not totals alone. Removing
one violation must not compensate for a different new violation. Track version,
configuration and scope changes. Checks never refresh their own baseline; baseline
changes require review and retained prior evidence.

Challenge gates in disposable fixtures: known pass, new violation, resolved debt
followed by reintroduction, missing analyzer, empty scope and incompatible config.
Propagate failures to the developer command. No global editor extensions, hooks,
CI settings or dependencies without authority. See the quality workflow for metrics.

Report findings and bounded proposed repairs; obtain repair authority before
behavioral changes or mass cleanup. Specs/quick notes govern execution and existing
checks stay enforced. Follow covers-self-critique for required independent review
and covers-verify for closeout; recommendations are not evidence those steps ran.

Provide exact working directory, prerequisites and one-shot commands. Separate
fast units from faithful expensive checks; never lower cryptographic parameters
to satisfy speed targets. Reconcile living guidance with actual results while
preserving historical specs. Metrics/lint do not prove correctness or release readiness.

SPEC-TOOL-027/R1-R4: JavaScript/TypeScript projects may opt into the distributed
ESLint adapter; read methodology/eslint-adapter.md (under .covers/ after adoption)
before execution. It uses reviewed project-local dependencies and explicit settings,
never installs/autofixes, and captures new candidates without accepting them.
Retain existing gates and archive reviewed baselines before deliberate tightening.
