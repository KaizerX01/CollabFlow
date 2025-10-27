-- V1__create_team_invitations_table.sql
-- Adjust the version number (V1, V2, V3, etc.) based on your existing migrations

CREATE TABLE team_invitations (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  team_id UUID NOT NULL,
                                  email VARCHAR(255) NOT NULL,
                                  token VARCHAR(255) NOT NULL UNIQUE,
                                  status VARCHAR(50) NOT NULL,
                                  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_team_invitations_team
                                      FOREIGN KEY (team_id)
                                          REFERENCES teams(id)
                                          ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);

-- Optional: Add comment to the table
COMMENT ON TABLE team_invitations IS 'Stores team invitation information for users';
COMMENT ON COLUMN team_invitations.token IS 'Unique invitation token for accepting invitations';
COMMENT ON COLUMN team_invitations.status IS 'Invitation status (e.g., PENDING, ACCEPTED, EXPIRED, CANCELLED)';