# CollabFlow Interview Prep (Q and A Style)

This document prepares you to explain the upgrade confidently in technical interviews.

## 1) 30-Second Pitch

Q: What did you build?
A: I upgraded CollabFlow with optimistic UI plus version-based conflict resolution for concurrent edits, and added OpenSearch-based search plus event-driven analytics read models for fast discoverability and dashboard metrics.

Q: Why is it valuable?
A: It improves collaboration UX, prevents silent overwrite bugs, and unlocks product intelligence through low-latency search and usage analytics.

---

## 2) Architecture Questions

Q: What consistency strategy did you use for concurrent edits?
A: Optimistic concurrency control with explicit expectedVersion and JPA versioning. The server rejects stale updates with HTTP 409 and returns latest server state for deterministic client rebase.

Q: Why not full CRDT?
A: For this product shape (tasks/projects forms and kanban moves), version checks give excellent correctness with lower complexity and lower operational risk than implementing CRDT merge semantics everywhere.

Q: How do you keep UX fast with strict consistency checks?
A: The client applies optimistic cache updates first, then reconciles with server responses. On conflict, it rolls back or rebases to the latest payload.

Q: What is the read/write split here?
A: Transactional writes remain in core relational entities. Search and analytics use read models: OpenSearch documents and daily analytics aggregates.

---

## 3) API Contract Questions

Q: What happens when two users update the same task?
A:
1. User A and User B both start from version 7.
2. User A saves first; server writes version 8.
3. User B saves with expectedVersion 7.
4. Server returns 409 VERSION_CONFLICT with currentVersion 8 and latest object.
5. Client rebases cache to latest and informs user.

Q: Why include latest in conflict response?
A: It lets clients recover without an extra fetch and avoids stale UI loops.

Q: Why 409 instead of 400/500?
A: Conflict is a valid domain outcome, not malformed input or server crash.

---

## 4) Search Questions

Q: Why OpenSearch/Elasticsearch instead of SQL LIKE?
A: We needed fuzzy matching, relevance ranking, and multi-field weighted search over tasks, projects, and activity. Search engines are purpose-built for this.

Q: How did you enforce tenant/team boundaries?
A: Team ID filter is applied in search query path and backed by membership authorization before query execution.

Q: What fields are indexed?
A: Resource type/id, team/project IDs, title, description, list name, actor username, assignees, priority, completion, and timestamps.

---

## 5) Analytics Questions

Q: How is analytics data generated?
A: Domain events are consumed and upserted into a daily aggregate table keyed by day/team/project/event_type.

Q: Why aggregate table instead of querying raw events every time?
A: Aggregate reads are much cheaper and support fast dashboards at scale.

Q: How would you improve idempotency?
A: Add event ID dedupe tracking for strict exactly-once semantics in the analytics consumer path.

---

## 6) Reliability and Tradeoff Questions

Q: What are key failure modes and your handling?
A:
- Conflict race: return 409 + latest
- Search index temporary failure: log and keep write path successful
- Consumer duplicate delivery: UPSERT aggregation, plus optional dedupe enhancement
- Client network errors during optimistic mutations: snapshot rollback + invalidate refetch

Q: What tradeoffs did you intentionally make?
A:
- Picked version checks over CRDT for complexity/risk balance
- Accepted eventual consistency in read models for scalability
- Chose non-blocking indexing to protect core transaction availability

---

## 7) Performance Questions

Q: Where is latency reduced most?
A: In user interactions via optimistic UI and in query response via specialized read models.

Q: Where does this scale?
A: Search and analytics scale independently from transactional write services because they consume events and keep dedicated read models.

---

## 8) Testing Questions

Q: What tests should exist for this architecture?
A:
- Integration test for 409 conflict contract
- Mutation race tests for task/project updates
- Authorization tests for team-scoped search
- Consumer tests for analytics aggregation correctness
- UI tests for optimistic update rollback/rebase flows

---

## 9) Interview Whiteboard Answer Template

Use this structure:
1. Problem: concurrent edits and poor discoverability/insights
2. Approach: optimistic UI + optimistic concurrency + read models
3. Design: event-driven indexing and analytics aggregation
4. Tradeoffs: CRDT avoided intentionally, eventual consistency accepted
5. Results: fast UX, safe writes, fast search and metrics
6. Future work: idempotency hardening, relevance tuning, observability

---

## 10) Quick Cheat Sheet

- Pattern: optimistic UI + optimistic concurrency control
- Conflict code: 409 VERSION_CONFLICT
- Search engine: OpenSearch/Elasticsearch
- Read model style: CQRS-lite
- Analytics model: event-driven daily aggregates
- Main value: speed + correctness + insight
