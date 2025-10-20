CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(100) NOT NULL,
                       description TEXT,
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE team_memberships (
                                  team_id UUID NOT NULL,
                                  user_id UUID NOT NULL,
                                  role VARCHAR(30) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
                                  joined_at TIMESTAMP DEFAULT NOW(),
                                  PRIMARY KEY (team_id, user_id),
                                  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


