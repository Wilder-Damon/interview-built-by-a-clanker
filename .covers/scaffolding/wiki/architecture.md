---
id: KN-ARCHITECTURE
title: Discovered current architecture
kind: overview
review_state: draft
sources: []
source_revisions: {} # Fill only after reviewing each registered source.
related: []
specs: []
invariants: []
---
# Discovered current architecture

Template only—adapt it under a covering project spec. Empty sections and this template are not evidence. Register reviewed sources and their exact `source_revisions`; use stable claim-level links. Exclude credentials and sensitive values.

## Scope and evidence legend

Assessment revision and working-tree state: <exact identity>

Assessed, sampled, unreviewed and blocked areas: <explicit boundaries>

Use these labels for material claims:

- **Observed:** verified through an authorized runtime, command or retained receipt.
- **Source-confirmed:** directly supported by inspected source/configuration.
- **Inferred:** reasoned from cited evidence but not directly observed.
- **Claimed-only:** stated by documentation or a stakeholder but not independently confirmed.
- **Unknown:** missing, contradictory or inaccessible evidence.

## System context

Describe users/actors, the system boundary, neighboring systems and principal responsibilities. Record current architecture only. Keep target architecture and recommendations in their separate section.

## Components and ownership

| Component/package/service | Responsibility | Interfaces and consumers | Runtime/owner | Evidence state and sources |
|---|---|---|---|---|
| <name> | <bounded responsibility> | <API/events/files/calls> | <where/who or unknown> | <label + citations> |

## Data and control flows

Trace representative entry points through validation, state changes, storage, outputs, errors and retries. Include asynchronous/event paths where applicable. A diagram is optional; provide a text equivalent so the architecture remains searchable and accessible.

## State, persistence and lifecycle

Record data stores, caches, ownership/tenancy, consistency, transaction and idempotency boundaries, startup/shutdown behavior, retention, backup/recovery and what is only in memory. Unknown durability remains unknown.

## Integrations and trust boundaries

List external services, network/file/process boundaries, authentication and authorization enforcement points, untrusted inputs, secrets by variable name only, and data sensitivity. Distinguish configured integrations from observed calls.

## Runtime and deployment

Describe processes, containers/functions/jobs, ports and network exposure, environments, configuration sources, scaling, health checks and operational dependencies. Separate declared configuration from observed runtime evidence.

## Build, test and observability architecture

Map source/workspace boundaries, generated artifacts, dependency direction, unit/integration/E2E layers, CI gates, logging, metrics, traces and alerting. Absence or lack of verification is explicit.

## Contradictions, risks and unknowns

| ID | Conflicting/missing evidence | Impact | Required validation or decision | Owner/status |
|---|---|---|---|---|
| ARCH-Q-001 | <unknown> | <bounded consequence> | <check or accountable decision> | <pending> |

## Target architecture and recommendations

Keep desired changes visibly separate from the discovered current architecture. Link each accepted proposal to a governing requirement/spec and migration evidence; do not present recommendations as implemented state.

## Freshness triggers

Review after material component, integration, data-store, trust-boundary, runtime/deployment or build/test-topology changes. A clean source hash means reviewed bytes are unchanged, not that the architecture remains semantically complete.
