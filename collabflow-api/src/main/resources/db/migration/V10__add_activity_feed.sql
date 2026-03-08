CREATE TABLE activity_feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE,
    event_type VARCHAR(64) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id UUID NOT NULL,
    actor_id UUID,
    actor_username VARCHAR(100),
    team_id UUID,
    project_id UUID,
    message TEXT NOT NULL,
    occurred_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_activity_feed_team_created
    ON activity_feed_items (team_id, occurred_at DESC);

CREATE INDEX idx_activity_feed_project_created
    ON activity_feed_items (project_id, occurred_at DESC);
