# CollabFlow Upgrade Guide (Cleaner + Deeper)

This document is a complete explanation of the upgrade, written in two layers:
- Layer 1: very simple explanation (kid-friendly)
- Layer 2: senior engineering explanation (architecture, tradeoffs, scaling, failure modes)

Related formats for different use cases:
- Interview Q and A pack: INTERVIEW_PREP_QA.md
- Team onboarding playbook: TEAM_ONBOARDING_PLAYBOOK.md
- GitHub README version with diagrams: README_COLLAB_UPGRADE.md

It covers:
- What was built
- How it works
- Why it works
- What was added or edited and why
- Mini-course style explanations of all key technologies and patterns

---

## 1) Executive Summary

We implemented two major platform upgrades:

1. Collaboration safety + speed
- Optimistic UI for instant interactions
- Version-based conflict detection and resolution for concurrent edits

2. Search + analytics read layers
- OpenSearch/Elasticsearch document index for discovery
- Event-driven analytics aggregate table for dashboard reporting

Business outcome: 
- Faster-feeling collaboration
- No silent overwrite of teammate changes
- Better discovery of tasks/projects/activity
- Better product insight through usage metrics

---

## 2) Explain Like You Are 6

Imagine one big toy city that many kids build together.

### The problem
- You move a toy car to one road.
- Another kid moves the same car somewhere else at the same time.
- If the game is not careful, one move can erase the other without warning.

### The fix
Every toy has a little number sticker called version.

- You send: "I changed toy version 5"
- Server checks: "Is toy still version 5?"

If yes:
- change is accepted

If no:
- server says: "Your copy is old. Here is the newest toy state."
- UI updates to the latest state

### Why it still feels fast
UI shows your move immediately first (optimistic UI), then confirms with server.

So you get both:
- fast feeling
- safe collaboration

---

## 3) System Design At A Glance

## Write path
User action -> API -> transaction update -> publish domain event

## Read paths
1. Search read model
- Domain events and entity updates maintain search documents in OpenSearch

2. Analytics read model
- Domain events aggregate into daily counters in Postgres

This is CQRS-lite:
- transactional write model for correctness
- specialized read models for speed and query flexibility

---

## 4) What Was Built

## A) Collaboration Upgrade

### 1. Optimistic UI in the frontend cache
- Mutations immediately patch local query cache
- Snapshots are kept for rollback if needed

### 2. Explicit version contract
- Client sends expectedVersion on task/project update operations
- Backend validates expectedVersion before applying changes

### 3. Conflict API contract
- HTTP 409 response when version mismatch happens
- Response includes:
  - code: VERSION_CONFLICT
  - expectedVersion
  - currentVersion
  - latest: authoritative server object

### 4. Client conflict recovery
- Detect 409 VERSION_CONFLICT
- Rebase cache to latest
- Show clear user message

Net effect:
- instant interaction under normal load
- deterministic conflict behavior under concurrent edits

## B) Search Layer

### 1. Search document model
Indexed entity types:
- task
- project
- activity

### 2. Search endpoint
Capabilities:
- team-scoped authorization filter
- optional type filters
- fuzzy multi-field matching
- recency sorting

### 3. Continuous indexing
Search documents are created/updated/deleted when entities/events change.

## C) Analytics Layer

### 1. Event-driven aggregate table
analytics_usage_daily stores daily counters by:
- day
- team_id
- project_id
- event_type

### 2. Analytics API
Returns:
- total events
- by-event-type distribution
- daily trend points

### 3. Dashboard integration
- global search panel
- usage analytics panel with rolling trend view

---

## 5) Why This Works (Engineering Logic)

## A) Correctness for concurrent writes
Version checks enforce optimistic concurrency control.

Guarantee:
- stale client cannot silently overwrite fresh server state

## B) Low latency user experience
Optimistic cache updates hide network round-trip from interaction path.

Guarantee:
- users feel immediate response

## C) Search relevance + scalability
Dedicated search index avoids expensive SQL text scans and gives richer relevance features.

Guarantee:
- better discoverability with lower query latency

## D) Analytics query efficiency
Pre-aggregated read model avoids expensive ad-hoc group-by on hot transactional tables.

Guarantee:
- fast dashboard reads at scale

---

## 6) Mini Course: Core Concepts You Just Implemented

## 6.1 Optimistic UI
Definition:
- Assume success in UI first, reconcile later.

Benefits:
- high perceived performance

Risks:
- temporary divergence if server rejects

Mitigation:
- snapshots, rollback, and rebase to latest server state

## 6.2 Optimistic Concurrency Control
Definition:
- Allow concurrent reads/writes but validate version at commit time.

Benefits:
- avoids lock-heavy pessimistic strategies
- prevents lost updates

Common server pattern:
1. Read row with version
2. Compare client expectedVersion
3. If mismatch -> 409 conflict
4. If match -> write and increment version

## 6.3 Conflict-as-Contract (HTTP 409)
Definition:
- conflict is a normal business outcome, not a crash

Why this is important:
- clients can implement deterministic recovery flows

## 6.4 OpenSearch/Elasticsearch Essentials
Core pieces:
- Index: collection of docs
- Document: JSON record
- Inverted index: fast term lookup
- Analyzer: tokenization and normalization
- Query DSL: expressive search logic

Features used here:
- multi_match query across weighted fields
- fuzziness for typo tolerance
- field filters for tenant/team isolation

When to use search engine over SQL LIKE:
- many text fields
- typo tolerance needed
- ranking relevance needed
- high query volume and low latency requirements

## 6.5 Event-Driven Architecture with Kafka
Definition:
- write model emits events, consumers build downstream capabilities

Why it matters:
- decouples core transactions from secondary systems
- enables independent scaling and evolution of read/notification/search services

## 6.6 Read Models (CQRS-lite)
Definition:
- separate write-optimized data from read-optimized projections

What you have now:
- transactional entities for writes
- search docs for discovery
- daily aggregates for analytics

## 6.7 Flyway Migration Discipline
Definition:
- schema changes are versioned and repeatable

Why it matters:
- deterministic environment setup
- safe CI/CD migrations

## 6.8 React Query Cache Orchestration
Useful primitives:
- onMutate for optimistic patching
- setQueryData/setQueriesData for local updates
- onError for rollback/rebase
- invalidateQueries for eventual consistency sync

---

## 7) End-To-End Flow Walkthroughs

## Flow A: Move task with possible conflict

1. User drags task in UI
2. UI applies optimistic cache move instantly
3. Request sent with newTaskListId/newPosition/expectedVersion
4. Backend checks task version
5. If versions match:
- persist move
- publish TASK_MOVED event
- update search document
- return updated task
6. If versions mismatch:
- return 409 VERSION_CONFLICT + latest task
- UI rebases cache to latest

## Flow B: Analytics ingestion

1. Domain event is published
2. Analytics consumer receives event
3. UPSERT increments daily bucket in analytics_usage_daily
4. Dashboard API queries pre-aggregated rows
5. UI renders trends and event distribution

## Flow C: Search query

1. User types search text
2. Frontend calls search API with team context and filters
3. Search service performs team filter + fuzzy multi-field query
4. Ranked documents returned (task/project/activity)
5. UI routes user to selected resource

---

## 8) Failure Modes And Handling

1. Concurrent update race
- Symptom: stale write attempt
- Handling: 409 conflict with latest payload, UI rebase

2. Search engine transient issue
- Symptom: index update fails
- Handling: non-blocking logging, transactional write remains successful

3. Consumer restart/duplication risk
- Symptom: repeated event delivery
- Handling: analytics aggregation uses UPSERT accumulation; can be enhanced with event-id dedupe table for strict exactly-once semantics

4. Client network error during optimistic operation
- Symptom: UI state diverges temporarily
- Handling: rollback snapshot + invalidation fetch

---

## 9) Added Files And Purpose

## Backend

1. src/main/java/com/collabflow/domain/common/exception/VersionConflictException.java
- typed conflict payload model

2. src/main/java/com/collabflow/domain/search/model/WorkItemDocument.java
- search document schema

3. src/main/java/com/collabflow/domain/search/repository/WorkItemSearchRepository.java
- search persistence abstraction

4. src/main/java/com/collabflow/domain/search/dto/SearchResultItemResponse.java
- search item DTO

5. src/main/java/com/collabflow/domain/search/dto/SearchResponse.java
- search response envelope

6. src/main/java/com/collabflow/domain/search/service/SearchIndexService.java
- indexing lifecycle logic

7. src/main/java/com/collabflow/domain/search/service/WorkItemSearchService.java
- search query orchestration

8. src/main/java/com/collabflow/presentation/controller/SearchController.java
- search API endpoint

9. src/main/java/com/collabflow/domain/analytics/dto/UsageAnalyticsResponse.java
- analytics response DTO

10. src/main/java/com/collabflow/domain/analytics/service/UsageAnalyticsService.java
- analytics query service

11. src/main/java/com/collabflow/presentation/controller/AnalyticsController.java
- analytics API endpoint

12. src/main/resources/db/migration/V13__add_project_version_for_optimistic_locking.sql
- project version column

13. src/main/resources/db/migration/V14__add_analytics_usage_daily.sql
- analytics aggregate table

## Frontend

14. src/lib/concurrency.ts
- conflict helper utilities

15. src/api/search.ts
- search API client

16. src/api/analytics.ts
- analytics API client

17. src/hooks/useSearch.ts
- search query hook

18. src/hooks/useUsageAnalytics.ts
- analytics query hook

---

## 10) Edited Files And Purpose

## Backend

1. pom.xml
- added spring-boot-starter-data-elasticsearch

2. src/main/resources/application.yml
- search and OpenSearch config

3. src/main/java/com/collabflow/domain/project/model/Project.java
- @Version field

4. src/main/java/com/collabflow/domain/project/dto/ProjectResponse.java
- expose version to client

5. src/main/java/com/collabflow/domain/project/dto/ProjectUpdateRequest.java
- expectedVersion contract

6. src/main/java/com/collabflow/domain/task/dto/TaskUpdateRequest.java
- expectedVersion contract

7. src/main/java/com/collabflow/domain/task/dto/TaskMoveRequest.java
- expectedVersion contract

8. src/main/java/com/collabflow/domain/task/service/TaskService.java
- version checks, event publishing, indexing sync

9. src/main/java/com/collabflow/domain/project/service/ProjectService.java
- version checks, event publishing, indexing sync

10. src/main/java/com/collabflow/events/model/DomainEventType.java
- expanded domain event vocabulary

11. src/main/java/com/collabflow/events/consumer/ActivityFeedEventConsumer.java
- indexing and new event messages

12. src/main/java/com/collabflow/events/consumer/AnalyticsEventConsumer.java
- analytics aggregation logic

13. src/main/java/com/collabflow/events/consumer/NotificationEventConsumer.java
- notification coverage for new events

14. src/main/java/com/collabflow/presentation/GlobalExceptionHandler.java
- standardized conflict responses

15. src/main/java/com/collabflow/presentation/controller/TaskController.java
- forwards expectedVersion in move flow

## Frontend

16. src/api/tasks.ts
- expectedVersion in update/move requests

17. src/api/projects.ts
- expectedVersion and version fields

18. src/hooks/useTasks.ts
- optimistic patch + rollback + conflict rebase

19. src/hooks/useProjects.ts
- optimistic update + conflict recovery

20. src/components/kanban/TaskDetailDialog.tsx
- version-aware updates and user-friendly conflict messages

21. src/pages/KanbanWorkspace.tsx
- version-aware drag and drop move requests

22. src/components/EditProjectDialog.tsx
- version-aware project edits

23. src/pages/ProjectsList.tsx
- passes current version into edit dialog

24. src/pages/ProjectDetails.tsx
- passes current version into edit dialog

25. src/pages/Dashboard.tsx
- global search + analytics UX

26. src/pages/ProfileSettings.tsx
- minor build cleanup (unused import)

---

## 11) Validation, Quality, And Confidence

Build validation performed:
- backend compile successful
- frontend production build successful

Current confidence level:
- high for core behavior and compile-time correctness
- medium for long-run behavior under high event volume until load/integration tests are added

---

## 12) Tradeoffs

1. Version checks vs full CRDT
- chosen: version checks
- reason: simpler, reliable, lower implementation risk for kanban/forms domain

2. Read models vs direct transactional queries
- chosen: read models
- reason: lower query latency and better scaling separation

3. Non-blocking indexing path
- chosen: do not fail core write on index failure
- reason: protects business transaction availability

---

## 13) Suggested Next Engineering Steps

1. Add integration tests
- 409 conflict payload contract tests
- team-scoped search authorization tests

2. Add index backfill
- bootstrap existing historical tasks/projects/activity into search index

3. Add observability
- conflict rate metric
- search latency percentiles
- analytics consumer lag and throughput

4. Add stronger event idempotency
- optional dedupe table keyed by event_id for analytics consumer

5. Add relevance tuning
- boosts by recency, priority, assignment, and project context

---

## 14) Quick Memory Hook

If you need one sentence to remember this architecture:

Fast UI for human experience, strict version checks for collaboration safety, and event-powered read models for scalable search and analytics.
