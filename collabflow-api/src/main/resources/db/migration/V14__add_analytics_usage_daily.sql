CREATE TABLE IF NOT EXISTS analytics_usage_daily (
    day DATE NOT NULL,
    team_id UUID NOT NULL,
    project_id UUID NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    event_count BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (day, team_id, project_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_analytics_usage_daily_team_day
    ON analytics_usage_daily (team_id, day DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_usage_daily_project_day
    ON analytics_usage_daily (project_id, day DESC);
