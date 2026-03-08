CREATE TABLE in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    recipient_id UUID NOT NULL,
    recipient_username VARCHAR(100) NOT NULL,
    title VARCHAR(140) NOT NULL,
    message TEXT NOT NULL,
    route VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_notifications_event_recipient UNIQUE (event_id, recipient_id)
);

CREATE INDEX idx_notifications_recipient_created
    ON in_app_notifications (recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_unread
    ON in_app_notifications (recipient_id, is_read);
