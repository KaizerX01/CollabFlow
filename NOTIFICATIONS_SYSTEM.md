# Notifications System Implementation Guide

This document explains how the notifications system was built across `collabflow-api` and `collabflow-ui`.

It covers:
1. Architecture and end-to-end flow
2. Every file updated/added for notifications
3. What changed in each file and why
4. How runtime behavior works (Kafka, DB, WebSocket, UI)

## Architecture

Implemented flow:

`backend domain event -> Kafka topic -> notification consumer -> in-app notification store -> WebSocket push -> frontend badge/popup`

Email notifications were intentionally left as a placeholder only, per requirement.

### Runtime Components

- Event source: domain services publish `DomainEvent` to Kafka topic `app.events.topic.system`
- Consumer group: `app.events.consumer-groups.notification`
- Storage: PostgreSQL table `in_app_notifications`
- Push channel: STOMP user destination `/user/queue/notifications`
- UI: global notification context + bell badge + panel + toast pop-in

## Backend Files (API)

### 1) `collabflow-api/src/main/java/com/collabflow/domain/notification/model/InAppNotification.java`

What changed:
- Added new JPA entity for in-app notifications.
- Fields include `eventId`, `eventType`, `recipientId`, `recipientUsername`, `title`, `message`, `route`, `isRead`, `createdAt`.
- Added indexes and unique constraint (`event_id`, `recipient_id`) for de-duplication.

Why:
- Need persistent in-app notifications (not just transient WebSocket messages).
- Need dedupe safety if events are redelivered/retried.

How it works:
- Consumer creates one row per recipient.
- UI reads from this table via REST and updates read/unread status.

### 2) `collabflow-api/src/main/java/com/collabflow/domain/notification/repository/InAppNotificationRepository.java`

What changed:
- Added repository methods:
	- `existsByEventIdAndRecipientId(...)`
	- `findByRecipientIdOrderByCreatedAtDesc(...)`
	- `countByRecipientIdAndIsReadFalse(...)`
	- `findByIdAndRecipientId(...)`
	- bulk `markAllReadByRecipientId(...)`

Why:
- Needed efficient unread count, paged history listing, owner-safe read updates, and dedupe checks.

How it works:
- `NotificationService` calls these methods for all user notification operations.

### 3) `collabflow-api/src/main/java/com/collabflow/domain/notification/dto/InAppNotificationResponse.java`

What changed:
- Added response DTO returned by notification endpoints and WebSocket push.

Why:
- Keeps API contract stable and decoupled from entity internals.

How it works:
- Service maps `InAppNotification` entity to this DTO for REST and STOMP payloads.

### 4) `collabflow-api/src/main/java/com/collabflow/domain/notification/dto/UnreadCountResponse.java`

What changed:
- Added DTO with single field `unreadCount`.

Why:
- Frontend needs a lightweight unread badge API call.

How it works:
- `GET /api/notifications/unread-count` returns this shape.

### 5) `collabflow-api/src/main/java/com/collabflow/domain/notification/service/NotificationService.java`

What changed:
- Added service methods:
	- `getNotifications(userId, limit)`
	- `getUnreadCount(userId)`
	- `markRead(userId, notificationId)`
	- `markAllRead(userId)`
	- `createAndPush(...)`
- Added `SimpMessagingTemplate` push using `convertAndSendToUser(recipientUsername, "/queue/notifications", dto)`.

Why:
- Central place to coordinate DB persistence + real-time push.

How it works:
- Consumer calls `createAndPush(...)`.
- Service dedupes event-recipient pair, saves row, and immediately pushes to the authenticated user’s queue.

### 6) `collabflow-api/src/main/java/com/collabflow/presentation/controller/NotificationController.java`

What changed:
- Added REST controller with endpoints:
	- `GET /api/notifications`
	- `GET /api/notifications/unread-count`
	- `PATCH /api/notifications/{id}/read`
	- `PATCH /api/notifications/read-all`

Why:
- Frontend needs history, unread count, and read state updates.

How it works:
- Uses `@AuthenticationPrincipal` to scope all operations to the logged-in user.

### 7) `collabflow-api/src/main/java/com/collabflow/events/consumer/NotificationEventConsumer.java`

What changed:
- Converted from logging-only consumer to real notification processor.
- Added recipient resolution from team memberships.
- Added message/title/route mapping by event type.
- Excludes actor from team/project/task/chat notifications (no self-noise).

Why:
- This is the core of `Kafka -> notification service -> store/push` pipeline.

How it works:
- On event consume:
	- Build notification blueprint (`title`, `message`, `route`)
	- Resolve recipients
	- For each recipient call `notificationService.createAndPush(...)`

### 8) `collabflow-api/src/main/java/com/collabflow/config/WebSocketConfig.java`

What changed:
- Enabled broker destinations for `"/queue"` in addition to `"/topic"`.
- Set user destination prefix `"/user"`.

Why:
- Private user-targeted notifications require user destinations.

How it works:
- Backend sends to `/user/{principal}/queue/notifications` via `convertAndSendToUser`.
- Frontend subscribes to `/user/queue/notifications`.

### 9) `collabflow-api/src/main/resources/db/migration/V11__add_in_app_notifications.sql`

What changed:
- Added new Flyway migration to create `in_app_notifications` table and indexes.

Why:
- Persistent storage for in-app notifications.

How it works:
- Runs on startup with Flyway and creates schema needed by JPA/repository.

### 10) `collabflow-api/src/main/java/com/collabflow/events/consumer/EmailEventConsumer.java`

What changed:
- Kept as placeholder only.
- Logs a TODO-style message for email-relevant event types.

Why:
- Requirement: do not implement email now, leave hook for later.

How it works:
- Consumer still receives events but does not send actual emails.

## Frontend Files (UI)

### 11) `collabflow-ui/src/api/notifications.ts`

What changed:
- Added notification API client:
	- `list(limit)`
	- `unreadCount()`
	- `markRead(id)`
	- `markAllRead()`

Why:
- Frontend needs typed access to notification backend endpoints.

How it works:
- Uses existing shared axios instance (`withCredentials`, auth interceptors).

### 12) `collabflow-ui/src/context/NotificationContext.tsx`

What changed:
- Added global notification state/context:
	- notifications list
	- unread badge count
	- websocket connection status
	- panel open/close state
- Added STOMP client subscription to `/user/queue/notifications`.
- Added toast pop-in on incoming live notification.

Why:
- Need app-wide live updates and badge management, not page-local state.

How it works:
- On login:
	- fetch initial list + unread count
	- connect STOMP with JWT header
	- subscribe to user queue
- On message:
	- prepend notification
	- increment unread count
	- show toast popup

### 13) `collabflow-ui/src/hooks/useNotifications.ts`

What changed:
- Added hook wrapper around `NotificationContext`.

Why:
- Cleaner usage in components and consistent error behavior if provider missing.

How it works:
- Returns context values/actions for UI components.

### 14) `collabflow-ui/src/components/NotificationBell.tsx`

What changed:
- Added floating bell UI with:
	- unread badge
	- expandable notification panel
	- list of notifications
	- mark-one-read and mark-all-read actions
	- click-to-navigate using notification route

Why:
- Requirement: bell notifications and live in-app pop UI.

How it works:
- Reads state from `useNotifications()`.
- Badge updates from unread count in context.
- Panel displays persisted notification history.

### 15) `collabflow-ui/src/App.tsx`

What changed:
- Wrapped app in `NotificationProvider`.
- Mounted `NotificationBell` at root so it is globally visible.

Why:
- Notifications should work everywhere once authenticated.

How it works:
- Provider lifecycle manages API fetch + WebSocket subscription.
- Bell remains available across routes.

## Existing Event Infrastructure Used

This notification system relies on the previously added event-driven base:

- `collabflow-api/src/main/java/com/collabflow/events/model/DomainEvent.java`
- `collabflow-api/src/main/java/com/collabflow/events/model/DomainEventType.java`
- `collabflow-api/src/main/java/com/collabflow/events/publisher/KafkaDomainEventPublisher.java`
- `collabflow-api/src/main/java/com/collabflow/config/KafkaEventConfig.java`

Without these files, no domain events would reach the notification consumer.

## End-to-End Flow Example

Example: user moves a task

1. `TaskService.moveTask(...)` publishes `TASK_MOVED` domain event.
2. Event goes to Kafka system topic.
3. `NotificationEventConsumer` receives event in notification consumer group.
4. Consumer resolves team recipients (excluding actor).
5. For each recipient:
	 - `NotificationService.createAndPush(...)` writes row in `in_app_notifications`.
	 - Service pushes DTO to `/user/queue/notifications` for that user.
6. Frontend `NotificationContext` subscription receives message.
7. UI updates unread badge and shows toast pop-in.
8. User opens bell panel, reads item, optionally marks as read.

## API Contract Summary

Base path: `/api/notifications`

- `GET /api/notifications?limit=20`
	- Returns most recent notifications for current user.
- `GET /api/notifications/unread-count`
	- Returns `{ "unreadCount": number }`.
- `PATCH /api/notifications/{notificationId}/read`
	- Marks one notification as read.
- `PATCH /api/notifications/read-all`
	- Marks all as read for current user.

## WebSocket Contract Summary

- Endpoint: `/ws` (SockJS)
- Auth: STOMP header `Authorization: Bearer <access_token>`
- Subscription for in-app notifications: `/user/queue/notifications`

## Notes / Intentional Decisions

- Email sending is intentionally not implemented yet; placeholder exists.
- Notification rows are persisted first, then pushed live.
- Dedupe uses unique key `(event_id, recipient_id)`.
- Event processing is asynchronous through Kafka consumer group.

## Verification Status

- Backend: compiles successfully.
- Frontend: notification files are valid; full UI build currently has unrelated pre-existing TypeScript issues elsewhere in project.

