# Stakeholder review — <domain or bounded change>

Copy to specs/reviews/<domain>-stakeholder-review.md and adapt. This is a decision record, not an executable spec, an approval already granted, or a second invariant catalog. Do not index it as a spec. Keep sensitive source content in an approved location and link minimally; no connector or meeting is mandatory.

## Review identity and authority

Adapt this template to any domain, language or delivery model. Categories, finding counts, roles and test layers come from the project, not the template. Library maintainers, service owners or data stewards may be the appropriate stakeholders. Existing issue/review systems can hold canonical decisions; link their stable reviewed versions rather than duplicate status. Mark inapplicable categories with rationale; no browser runner, container, wiki or connector is required.

- Review ID and revision: <stable project review ID; revision or immutable artifact reference>
- Status: pending / partially decided / decisions recorded / superseded
- Mode: exercise / operational (choose explicitly; practice is not production approval)
- Scope, exclusions and governing spec IDs: <bounded domain/change>
- System revision and relevant local changes: <retrievable immutable commit/blob, or retained diff against an identified base plus untracked content snapshots>. Hashes verify retained content; they cannot replace it.
- Requirements/source references and consulted versions: <authorized source content, not just link titles>
- Accountable stakeholder(s) and role/decision authority: <actual business/product/domain, security or technical owner; unknown stays pending>
- Prepared by / prepared date: <name or agent and date; preparation is not approval>

## 1. Suspected defects: agree on the behavior

### Present the whole known inventory first

Prepare this packet after bounded discovery/baseline and before repair selection. Include all currently registered findings in the review scope, not a single chosen example. For large systems link a master index and domain batches. Keep unknown/unreviewed areas explicit; this is not certification that all possible defects were found. If a project wiki exists, maintain a cited findings overview linked to this worksheet; otherwise this document is sufficient and requires no extra tooling.

Present a concise summary of counts by evidence state and domain, then the rows below with impact and proposed actions. Keep engineering quality gaps distinct from bugs. Include sanitized security finding IDs and summaries only where appropriate for the audience, linking to their canonical restricted register without duplicating live remediation status. Never infer permission to share restricted evidence from a link or file location.

Review the batch together. Ask for fix / investigate / defer / not-a-defect selections by ID, plus priorities, owners and rationale. An explicit list can share one decision with named exceptions; expand the decision evidence to exact IDs and reviewed versions. Silence, “looks good” or approving the page design is not approval of all findings. A hypothesis selected for work still needs investigation, not an invented confirmation. Defer needs a reason and revisit trigger. Capture business disposition separately using the vocabulary below.

Record each discovered in-scope observation. Expected behavior must come from a requirement or explicit decision, not an assumption that old code is correct. Evidence state (reproduced, source-supported, hypothesis) is separate from stakeholder disposition. Add rows rather than implying this is an exhaustive list of all defects.

| Defect ID / source reference | Trigger and observed result / evidence state | Proposed expected behavior and source/version | Impact / priority | Stakeholder disposition | Fix/defer decision, owner and revisit | Decision reference |
|---|---|---|---|---|---|---|
| <ID> | <facts and evidence link; no secrets> | <proposal; mark ambiguous> | <reasoned impact> | pending | pending | pending |

Disposition vocabulary: confirmed defect / expected behavior / accepted limitation / needs clarification / pending. Confirming a bug does not mean it is fixed. Accepting a limitation requires an owner and revisit trigger and does not erase a violation of a still-applicable invariant. Resolve that conflict explicitly before affected work. Preserve prior dispositions and link superseding decisions rather than silently rewriting them.

## 2. Candidate invariants: approve the enduring rules

invariants.json remains the canonical catalog. Reference each candidate ID and the exact reviewed statement/version through retrievable immutable content: a retained commit/blob, a preserved diff against an identified base, an access-appropriate snapshot/excerpt, or a durable document version. Retain the reviewed scope/preconditions and exceptions as well as the statement; include untracked content where necessary. Hashes verify those retained artifacts, never substitute for them. Another reviewer must be able to recover the approved meaning after the current catalog changes. A review snapshot is historical evidence, not a competing editable source. Include severity, known violations and the proposed enforcement/behavioral checks.

| Invariant ID / reviewed statement version | Scope, preconditions and severity | Related defects / conflicts | Proposed enforcement and behavioral check | Stakeholder decision | Decision reference |
|---|---|---|---|---|---|
| <existing candidate ID and revision> | <bounded rule> | <IDs or none known> | <test/manual check proposal; not a pass> | pending | pending |

Decisions: approve / revise / reject / pending. The appropriate accountable domain/security/technical owner approves; agent critique, silence, a meeting invitation or test success is not approval. An approved invariant may be currently failing or unverified. Record acceptance separately from verification. A revised meaning needs re-review; material changes to an existing accepted rule use a new ID/supersession under the covering spec.

## 3. Decision evidence

For each decision, record:

- Decision ID; affected defect/invariant IDs and exact reviewed versions.
- Mode and acting role on this decision: business / developer / authorized security-risk owner. One person may practice multiple roles; record each separately. Required independent approval still needs a different qualified reviewer.
- Actual reviewer name, role and authority; approval date.
- Decision, rationale, exceptions and alternative considered where consequential.
- Durable evidence reference: recorded user response, authorized ticket/document decision, or signed/reviewed local record. Do not invent signatures, names, consent or dates.
- Superseded decision, if any; preserve the prior record and its scope.

No decisions recorded yet. Replace this sentence only when real decision evidence exists. The agent may prepare a record from supplied decisions but must identify that provenance.

Exercise decisions stay labeled practice and do not promote live candidates or authorize production work. Converting a practice conclusion into an operational decision requires a fresh explicit decision from the actual authorized owner against the reviewed version.

Keep security findings in specs/reviews/<domain>-security-findings.md using the security-findings template. Link stable IDs here rather than duplicating current security status. Business acceptance of behavior is not security risk acceptance; use the appropriate risk owner's separate decision. Keep sensitive details in restricted evidence storage: separate Markdown files do not create access controls.

## 4. Reconcile and hand off

- [ ] Every currently registered finding in this review scope is represented or linked with an explicit audience/scope exclusion; unknown areas and quality gaps are not mislabeled as defects.
- [ ] Batch decisions enumerate exact IDs and exceptions, and keep business, engineering and security roles/authority distinct. Pending rows remain visible.
- [ ] All in-scope observations have a disposition, or unresolved items identify exactly which work must wait.
- [ ] Candidate approvals/revisions/rejections have real owner, version, date and evidence references.
- [ ] Authorized decisions are reconciled into governing specs and invariants.json; registry refreshed when spec metadata changes.
- [ ] Accepted invariants have meaningful automated or explicit manual behavioral-check mappings; approval evidence is not itself enforcement evidence. Verification remains passing/failing/unverified truthfully.
- [ ] Conflicts and deferred risk have named owners, rationale and revisit triggers; affected behavior-changing work waits where unresolved.
- [ ] Material changes after review trigger renewed approval of the changed meaning/version; unchanged unrelated decisions remain valid.
- [ ] Separate implementation authority is recorded in the governing spec. Business approval alone is not permission to install, edit, commit, deploy or access external systems.

Independent read-only analysis, unrelated approved work and unambiguous technical repairs may proceed under their own specs without waiting for business interpretation. Technical invariants still go to the appropriate accountable technical owner. Urgent safety containment requires explicit authority and a recorded scope; the agent cannot invent an emergency exemption.

## Follow-up and history

Refresh the optional derived wiki after canonical decisions change. Add later discoveries to subsequent batches without silently rewriting prior approvals or reopening unaffected decisions. The review can proceed without a formal meeting, exhaustive audit or coverage target already met. Repair selection is not itself execution authority.

List resulting spec IDs, deferred items, owner actions and next review triggers. Keep this record permanently with its evidence. Review documents are not auto-discovered approvals: current COVERS tooling validates metadata/path accountability, not reviewer identity, business agreement or semantic compliance.
