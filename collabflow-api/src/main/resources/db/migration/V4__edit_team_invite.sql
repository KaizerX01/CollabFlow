-- Drop the existing team_invitations table
DROP TABLE IF EXISTS team_invitations CASCADE;

-- Create the new team_invites table
CREATE TABLE team_invites (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              team_id UUID NOT NULL,
                              invited_by UUID NOT NULL,
                              token VARCHAR(255) UNIQUE NOT NULL,
                              expires_at TIMESTAMP NOT NULL,
                              is_active BOOLEAN DEFAULT TRUE NOT NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key constraints
                              CONSTRAINT fk_team_invites_team
                                  FOREIGN KEY (team_id)
                                      REFERENCES teams(id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_team_invites_invited_by
                                  FOREIGN KEY (invited_by)
                                      REFERENCES users(id)
                                      ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_team_invites_invited_by ON team_invites(invited_by);
CREATE INDEX idx_team_invites_is_active ON team_invites(is_active);
CREATE INDEX idx_team_invites_expires_at ON team_invites(expires_at);

-- Optional: Create a composite index for common queries
CREATE INDEX idx_team_invites_team_active ON team_invites(team_id, is_active);