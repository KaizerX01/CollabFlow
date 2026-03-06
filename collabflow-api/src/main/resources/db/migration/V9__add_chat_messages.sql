-- V9: Add chat_messages table for project-scoped real-time chat
CREATE TABLE chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id   UUID         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Index for efficient retrieval of latest messages per project
CREATE INDEX idx_chat_messages_project_created
    ON chat_messages (project_id, created_at DESC);

-- Index for sender lookups
CREATE INDEX idx_chat_messages_sender
    ON chat_messages (sender_id);
