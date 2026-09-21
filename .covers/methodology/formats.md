# Artifact formats (schema version 1)

Paths are repository-relative forward-slash paths. Specs use YAML with unique keys and no aliases. JSON frontmatter is also valid YAML. ID forms are SPEC-[A-Z0-9-]+ and INV-[A-Z0-9-]+. Registry entries reproduce frontmatter plus the discovered path; unknown metadata is retained. Run index explicitly after reviewing changes, then validate.

Each spec requires domain: a lowercase hyphenated slug such as authentication, payments, or website. Terminal specs may move from specs/2_completed into specs/history/<domain>/, preserving their exact status (complete or verified_local), identity and file bytes. The history directory must match the domain metadata. Registry discovery includes archived specs; duplicate copies with the same ID are errors.

## Spec and file values — SPEC-TOOL-032/R1

`status` permits exactly `draft`, `ready`, `in_progress`, `blocked`, `complete`,
`verified_local` and `superseded`. `ready`/`in_progress` belong in `specs/1_active`.
`complete` and `verified_local` belong in `specs/2_completed` or domain history;
they cannot authorize implementation. Existing superseded placement remains valid.
`complete` retains its verified-and-integrated meaning; local verification is
explicitly distinct. A blank draft template is not execution-ready; adapt the full
example in `scaffolding/master-spec.md` and supply real authority and review.

Every file record requires `path`, `action` and `state`, including planned work:

```yaml
files:
  - {path: src/example.js, action: modify, state: planned}
  - {path: tests/example.test.js, action: add, state: planned}
  - {path: src/renamed.js, from: src/old.js, action: rename, state: changed}
```

Actions are `add`, `modify`, `delete`, `rename`; states are `planned`, `changed`,
`not_changed`. Use safe repository-relative paths, no wildcards or traversal;
rename requires distinct exact files. Invalid records identify `files[index].field`
without echoing the invalid value. YAML diagnostics give the spec's relative path
and actual document line/column (including the opening frontmatter delimiter),
without scalar snippets. Fix syntax, duplicate keys or forbidden aliases, then
review and explicitly reindex. Failures stay nonzero; diagnostics do not repair
metadata or establish approval.

## Requirements sources

Optional `requirements` is a list of source records; omission or `[]` means no external sources recorded, not that requirements were verified. No separate requirements document or connector is necessary.

```yaml
requirements:
  - id: BR1
    source: https://jira.example.com/browse/APP-42
    summary: Users can export their own account data.
    revision: "Reviewed 2026-09-19; ticket revision 3"
  - id: BR2
    source: docs/requirements.md#export
    summary: Exports exclude credentials and internal-only fields.
```

Each entry requires a unique nonempty id, source and summary. Source is an opaque URL or file/reference locator, including email or Confluence references; repository-relative paths are preferred for portable files. It is never executed or automatically opened by the validator. Optional context/revision metadata is retained. Avoid secrets or token-bearing links. Private sources can be supplied as authorized sanitized excerpts without installing integrations.

In the spec body map, for example, `BR1 -> R1 -> export ownership tests`; map BR2 to exclusion assertions. Compare the spec with source content and report omissions, contradictions and inaccessible evidence. An inaccessible URL is not a validation pass. Passing shape checks or a linked test does not prove business alignment or test execution. The registry preserves these records and search includes their text. Local R1 acceptance IDs in file/test mappings remain distinct from upstream BR1 source IDs.

## Permanent decisions

SPEC-TOOL-019/R3: optional sdd_mode defaults to spec-led. Values spec-led, spec-as-source and spec-anchored describe authoring preferences; human edits are allowed without a mode_exception. Preserve existing historical exception records. This metadata proves neither approval nor implementation provenance.

Optional amends is an array of existing spec IDs; empty means no prior work is amended. Completed/history behavior changes require a new spec and amends link. Active specs can be revised before execution with an amendment record. amends is not an execution dependency; use depends_on separately when needed. Unknown references, self-links and cycles are errors. Preserve original completed decisions and add a new decision with supersedes when changing them.

```yaml
key_decisions:
  - id: D1
    decision: Enforce uniqueness in the database.
    rationale: A pre-save lookup alone permits concurrent duplicate writes.
    alternatives: [Application-only pre-save check]
    consequences: [Map constraint errors to a stable API response]
```

A later decision can add `supersedes: SPEC-012/D1`. Do not delete the original. IDs are stable within each spec; reference them using the spec prefix. The validator checks shape and target existence, not whether the rationale is correct.

## Invariant examples

```json
{
  "schema_version": 1,
  "invariants": [
    {
      "id": "INV-DATA-EXPERIMENT-001",
      "statement": "Experiment IDs are unique within the tenant.",
      "scope": ["experiment persistence"],
      "severity": "CRITICAL",
      "status": "candidate",
      "introduced_by": "SPEC-012",
      "checks": [],
      "verification": {"status": "unverified"}
    },
    {
      "id": "INV-SEC-REVIEW-001",
      "statement": "Privileged integration changes require documented review.",
      "status": "accepted",
      "introduced_by": "SPEC-012",
      "checks": [{"kind": "manual", "name": "Privileged access review"}],
      "verification": {"status": "unverified"}
    }
  ]
}
```

These are examples, not rules to adopt blindly. SPEC-012 must exist. Accepted invariants need at least one check. An automated check needs an existing path and descriptive name, e.g. `{"kind":"automated","path":"tests/uniqueness.test.ts","name":"concurrent inserts reject duplicate identity"}`. Names are traceability, not proof of test discovery/execution. Supply actual enforcement file/symbol mappings and current run evidence as appropriate. Candidate, accepted, deprecated and rejected are lifecycle states; acceptance does not mean current verification passed.

## Tool boundaries

SPEC-TOOL-019/R1-R2: this schema describes formal Full specs. Plain Markdown notes in specs/quick are excluded from registry discovery and cannot act as formal dependencies. They need no YAML or detailed mappings; see workflows/lite.md for retention and promotion.

Explicit `drift --base REF --policy report` works without formal artifacts in a minimal Git repository. Existing partial/corrupt formal artifacts still produce errors. No --spec means implementation changes are unmapped, not approved by a quick note. Selected IDs still undergo readiness. Snapshot mismatch is a warning and affected changes stay unmapped. The result includes policy, outcome (mapped/unmapped/incomplete), warnings and typed changes. Report mode exits zero on a successfully produced report even when unmapped; incomplete checks and operational failures remain nonzero. Zero is not compliance. Default --policy enforce still fails on unmapped paths; mode and policy are independent. No automatic hook/CI change occurs.

validate checks core shape, duplicate IDs, parents/dependencies/cycles, invariant introduction/check paths, decisions/supersedes, folder state and registry equality. It does not yet validate every optional domain field or implement a complete external JSON Schema standard. It never executes arbitrary commands embedded in metadata.

## Readiness and typed drift — SPEC-TOOL-013/R1-R5

Under default enforced drift, metadata-only closure can use an empty specs selection because it authorizes no implementation. Structural validation and human review still apply. Non-specs implementation changes require executable selected IDs. Explicit advisory reporting is described below.

Structural validate remains compatible with historical metadata. It rejects decision supersession cycles, malformed invariant checks, wildcard scope and from fields outside rename. It does not prove execution readiness.

New execution specs declare acceptance: [{id: R1, description: Observable expected outcome}]. IDs are nonempty and unique in that spec. readiness --spec SPEC-ID[,SPEC-ID] defaults to phase execute and requires ready/in_progress status, criteria and completed prerequisites with criteria/evidence recursively. The explicit no-Git local exception is described below. Parent is coordination, not a prerequisite. Historical completed specs without these fields stay structurally valid but need an explicit evidence-backed migration before serving as verified prerequisites; never fabricate old results.

readiness --spec SPEC-ID --phase complete also requires verification: {revision: nonempty tested identity and local state, outcome: passed, evidence: [specs/reviews/receipt.md]}. Evidence paths must resolve to existing safe local files (not URLs or fragments). This checks declarations/references, not test execution, semantic correctness, approval or evidence freshness. Keep detailed commands and results in receipts. Complete-phase validation may run while a spec is still active; status only changes after verification AND integration in a metadata-only follow-up.

### Explicit local closure — SPEC-TOOL-032/R2

For verified work in a deliberately source-control-free project, run
`readiness --spec SPEC-ID --phase local`. It accepts selected `ready`, `in_progress`
or retained `verified_local` records, requires the same nonempty acceptance and
passed revision/evidence references, and requires these additional declarations:

```yaml
verification:
  revision: Reviewed filesystem snapshot and local changes, identified in the receipt
  outcome: passed
  evidence: [specs/reviews/local-verification.md]
  scope: local
  integration: unavailable
```

This is an example to adapt after actual verification, with an existing receipt.
Substantive acceptance, required independent review and unresolved required findings
remain human/workflow gates; missing review or failed acceptance prevents closure.
The command only checks declarations/references and never certifies those outcomes.
After those gates, move the record into `specs/2_completed` with
`status: verified_local`. No Git initialization is required or performed. This
status means neither integration nor release, and never authorizes implementation
or drift. Default execute/complete phases retain their existing purpose; complete
does not accept `verified_local` or explicitly local-only verification evidence.

The local guard checks the target and every ancestor without invoking Git. Any
`.git` directory/file (including worktree markers), bare-repository layout,
symlink/junction in the target/ancestor chain, or inspection error prevents a
positive no-Git result. It conservatively treats all inherited `GIT_*` variables,
including empty values and configuration injection, as unsupported context and
does not print their values or discard them. Unsupported context remains unknown;
do not unset variables to manufacture absence. These are metadata/filesystem
checks, not application tests or proof against concurrent filesystem changes.

A `verified_local` prerequisite may satisfy execute/local readiness recursively
only after the same positive no-Git check, with criteria and local verification
evidence. Complete-phase and typed Git drift always require `complete`
prerequisites, regardless of locally eligible readiness or supplied metadata.
Existing `complete` records remain structurally compatible without new fields.

Git adoption does not invalidate the structural readability of local history.
Preserve the original approval/evidence and create a new integration/amendment
record; do not rewrite `verified_local` as integrated. `archive --spec SPEC-ID`
retains local status, identity and bytes, including after Git adoption, and updates
only the registry path. Archive is not local verification or promotion to complete.

drift --base REF --spec SPEC-ID[,SPEC-ID] requires explicit selected IDs passing execution readiness. Old broad active specs are not automatically selected. Modes: local (default) unions branch (merge-base..HEAD), index (HEAD..index), and worktree (index..working tree plus untracked). Each layer keeps its operation. Cancelling unstaged edits never erase staged changes. An added file edited again may need add and modify declarations. Index/branch layers containing implementation changes fail if working specs differ from their metadata snapshot; stage reviewed metadata for index checks or commit it for branch checks. No automatic staging or commands from specs.

File records match their action exactly: add, modify, delete, rename. A trailing slash scopes descendants recursively for that action only; src/ does not cover src-other/. Wildcards are invalid. Rename records require exact, distinct from/to files (no directory renames); alternatively declare delete(old) plus add(new). Both endpoints matter, including moves across specs/. Git type changes/conflicts unsupported by these actions stay uncovered. Specs-only changes are exempt from path mapping, not validation or human review. Hashes/comments are not behavioral validation. CI uses branch mode and reviewed explicit selection; local hooks use index mode. Selection is declared scope, not proof of approval.

SPEC-TOOL-016/R2: Git detects renames from content similarity, not the fact that someone used `git mv`. A rename with substantial rewriting can appear as separate deletion and addition, so a rename-only scope deliberately will not cover it. Inspect the same layer you are validating (for example `git diff --cached --name-status --find-renames` for index). Amend the active spec to declare `delete` for the exact old path and `add` for the exact new path before proceeding, then regenerate/stage the reviewed registry and spec together. That explicit pair also covers a detected rename with the same endpoints. Do not broaden scope or weaken detection thresholds merely to pass the gate.
