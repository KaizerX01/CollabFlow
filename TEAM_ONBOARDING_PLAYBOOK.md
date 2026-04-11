# CollabFlow Team Onboarding Playbook

Note: A fully consolidated single-file version of all docs is available at COLLABFLOW_MASTER_GUIDE.md.

This playbook helps new engineers understand, run, and extend the collaboration, search, and analytics architecture.

## 1) What You Are Joining

Core principles:
- Fast interactions for users
- Safe concurrent writes
- Read models for query-heavy workloads

Main building blocks:
- Frontend: optimistic React Query mutations
- API: expectedVersion contracts + 409 conflicts
- Events: domain events as integration backbone
- Search: OpenSearch/Elasticsearch index
- Analytics: daily aggregate table from consumers

---

## 2) Day 1 Setup Checklist

1. Start database and Kafka dependencies.
2. Start OpenSearch/Elasticsearch endpoint.
3. Run backend and apply Flyway migrations.
4. Run frontend.
5. Verify:
- task/project updates include expectedVersion
- search endpoint returns results for authorized team
- analytics endpoint returns totals and daily points

---

## 3) Mental Model

Write path:
- User action -> API validation -> transaction write -> event publish

Read paths:
- Search index updates from entity/event changes
- Analytics aggregate updates from events

Consistency model:
- Strong consistency for transactional writes
- Eventual consistency for search/analytics read models

---

## 4) Operational Playbook

## A) Conflict spike reported

Symptoms:
- Users see more conflict messages

Actions:
1. Check conflict rate in logs/metrics.
2. Identify high-contention resources (same task/project edited repeatedly).
3. Verify frontend is rebasing latest payload correctly.
4. Consider UX improvements for contention hotspots (inline refresh hints, lock-free warning badges).

## B) Search stale or missing docs

Symptoms:
- recently changed tasks not searchable

Actions:
1. Check indexer logs for failures.
2. Verify search endpoint filters and team IDs.
3. Run backfill/reindex for missing entities.
4. Confirm OpenSearch cluster health and index mappings.

## C) Analytics numbers look off

Symptoms:
- dashboard totals drift from expected

Actions:
1. Validate consumer lag and restart history.
2. Check aggregation UPSERT logic.
3. Add dedupe strategy by event_id if duplicates are confirmed.
4. Run reconciliation query against source events if available.

---

## 5) Change Playbook

## A) Adding a new event type

1. Add enum value to event type list.
2. Publish event from write service where domain action happens.
3. Update consumers:
- notification messaging
- activity feed mapping
- analytics aggregation behavior
- search indexing behavior if needed
4. Add tests for end-to-end propagation.

## B) Adding a searchable field

1. Add field in search document model.
2. Populate field in indexing service.
3. Add field in search query weighting.
4. Reindex historical documents.

## C) Adding new analytics dimension

1. Extend aggregate schema or create new aggregate table.
2. Update consumer UPSERT logic.
3. Add API response field.
4. Update dashboard visualizations.

---

## 6) Testing Playbook

Minimum test gates before merge:
- Backend compile and unit tests
- Frontend build and unit tests
- API integration tests for conflict contract
- Search authorization tests
- Analytics aggregation correctness tests

Recommended extra checks:
- Parallel update race test
- Reindex smoke test
- Consumer restart resilience test

---

## 7) Security and Data Boundaries

Rules:
- All search/analytics requests must be team-authorized.
- Never return cross-team records in search results.
- Keep event payloads minimal and avoid sensitive data leakage.

---

## 8) Performance Playbook

When latency grows:
- Search:
  - inspect query complexity and shard health
  - tune field boosts and mappings
- Analytics:
  - optimize index coverage on aggregate table
  - bound date windows and pagination
- Frontend:
  - avoid global invalidations where scoped updates are enough
  - keep optimistic patches narrow and deterministic

---

## 9) Ownership Map (Suggested)

- Collaboration consistency: API + frontend mutation maintainers
- Search relevance/indexing: search/read-model maintainers
- Analytics quality: event consumer + dashboard maintainers
- Platform reliability: observability + infra maintainers

---

## 10) Onboarding Milestones

Week 1:
- Run system locally and trace one task update end-to-end.

Week 2:
- Add one small event type enhancement with tests.

Week 3:
- Ship one search relevance or analytics metric improvement.

Week 4:
- Lead a short architecture walkthrough for new joiners.
