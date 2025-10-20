CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id UUID NOT NULL,
                                token VARCHAR(255) UNIQUE NOT NULL,
                                expiry_date TIMESTAMP NOT NULL,
                                created_at TIMESTAMP DEFAULT NOW(),
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
