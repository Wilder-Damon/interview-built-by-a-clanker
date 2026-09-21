# From a promising method to demonstrated engineering practice

Governing spec: SPEC-TOOL-011/R1,R3. This is an evaluation plan, not a certification, current score or claim of completed field trials. A conversational rating such as 8/10 is an opinion, not measured reliability. A useful interpretation of “10/10” is meeting a declared quality bar with independently reviewable evidence, while still acknowledging residual risk.

## Evidence, not a compensating average

For each dimension record the project/release/profile, accountable owner, target, evidence locator and revision, observed result, remaining gap and next decision. Use **unexamined / designed / locally verified / independently reproduced / operationally demonstrated**, with not-applicable rationale where justified. These are evidence labels, not interchangeable numbers. A failed safety or required acceptance gate blocks readiness even if other dimensions look excellent.

| Dimension | Evidence needed to support a strong claim |
|---|---|
| Reproducible onboarding | A second person or agent can start from a clean checkout, reconcile existing steering/specs, discover the intended skills, and reproduce setup/checks using only the documented inputs. Record time, manual interventions, privileges, downloads and failures. |
| Intent and decision fidelity | A real requirement change follows intake → spec/decision/invariant → code/test → retained evidence. An independent reviewer can recover why a historical decision changed. Conflicting or stale sources stop the affected change. |
| Meaningful behavioral protection | Approved defects have genuine red/green evidence; preservation tests remain green; agreed critical journeys include applicable failure, ownership, transition and recovery cases. At least 80% of each supported coverage metric on honest scope is achieved, with meaningful assertions and disclosed package gaps. Coverage alone is insufficient. |
| Gates that actually detect violations | In a disposable fixture, demonstrate a real behavioral regression, missing/empty report, unmapped change and stale reference fail the intended gate; legitimate changes pass. Verify the actual runner selected the expected tests and propagated exits. CI configuration and observed remote merge enforcement are separate evidence. No production mutation is authorized by this checklist. |
| Team handoff and maintenance | Another contributor resumes from a concise current handoff without private chat context. Exercise concurrent specs/registry regeneration, ownership and an upgrade conflict without losing customization or history. Test selected agent/editor adapters; copied files do not prove discovery. |
| Operational and security fit | Within an approved threat model, demonstrate relevant isolation, secret/data boundaries, rollback/recovery and observability. Record owner-approved residual risks and expiry. AI-enabled products additionally need task-quality, adversarial-input, model/version, latency and cost evaluations. A method used with AI is not itself proof that an AI product is safe. |
| Measured value across projects | Repeat bounded work on different justified profiles, such as a stateful application and a non-browser library/service, with different maintainers where practical. Retain failures and adaptations as well as successes. Compare lead time, human review/rework, escaped defects by severity, flaky-test rate and total agent/tool cost over a stated observation window. No unsupported causality or fabricated ROI. |

## Practical progression

1. **Finish one credible pilot:** characterize → review findings together → authorize repairs → red/green → coverage-directed tests → strict quality ratchet. Record what remains out of scope. Do not require impossible proof that every bug is gone before the next bounded decision.
2. **Challenge the controls:** under a separate bounded spec, use disposable known-pass/known-fail fixtures to test drift/gate failure propagation, test selection and safe restoration. Mutation testing remains optional and requested separately.
3. **Perform a cold handoff:** have another contributor reproduce the documented slice and identify missing instructions without relying on the original author. Fix the smallest reusable friction, not every hypothetical extension.
4. **Repeat on contrasting profiles:** prerecord scope, targets and measurement definitions; preserve before/after denominators and observation windows. Report environment and team differences instead of treating one small example as universal evidence.
5. **Release deliberately:** version toolkit artifacts, prove non-overwriting adoption and upgrade handling, settle license/distribution terms, document supported adapters and limitations. Consulting promises must not exceed demonstrated evidence.

The core remains Markdown, existing project tools and the local validator. Do not add a mandatory dashboard, service, analyzer or approval bureaucracy just to score well. Use the team's existing review/CI system. Unknown evidence stays unknown; a self-critique rating cannot fill it in. An independent critique identifies gaps—it is not a mandate to iterate until the reviewer prints 10.

## Lightweight evaluation record

Keep a small table in the governing project spec or existing review document:

| Dimension / requirement | Scope and owner | Target / observation window | Evidence and actual result | Gap / next decision |
|---|---|---|---|---|
| Select applicable rows above | Pending | Define before measurement | Unexamined | Pending |

No duplicate live registry is needed. Distinguish method/toolkit readiness, an individual project's release readiness and the quality of one spec. None can be inferred solely from the other two.
