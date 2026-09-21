# COVERS partial-onboarding handoff

Use this only when onboarding cannot finish safely. It records state; it does not convert pending evidence into a pass.

## Completed checks

- Record each command or observation that actually completed, with its outcome.

## Pending evidence

- List every unfinished record or check and why it remains pending.

## Exact observed errors

- Preserve the exact supported-tool error. Do not guess or attribute its cause without direct evidence.

## Boundary unchanged

- State which application files, dependencies, services, credentials, network destinations, and repository operations remained untouched.

## Approvals

- Record each approval class requested, approved, declined, or exhausted. Do not treat repeated equivalent prompts as new classes.

## Resume request

```text
$covers-onboard Resume the partial COVERS onboarding from existing artifacts. Batch remaining COVERS-only reads, writes, and metadata checks. Do not locate or invoke internal patch utilities, bypass the sandbox, or touch application code unless separately authorized.
```
