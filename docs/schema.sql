BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    password_hash VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    notes TEXT,
    study_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    url TEXT NOT NULL,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'documentation',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resources_type_check CHECK (
        resource_type IN ('documentation', 'tool', 'article', 'video', 'other')
    )
);

CREATE INDEX IF NOT EXISTS topics_user_id_idx
    ON topics(user_id);

CREATE INDEX IF NOT EXISTS learning_logs_user_id_idx
    ON learning_logs(user_id);

CREATE INDEX IF NOT EXISTS learning_logs_topic_id_idx
    ON learning_logs(topic_id);

CREATE INDEX IF NOT EXISTS resources_user_id_idx
    ON resources(user_id);

CREATE INDEX IF NOT EXISTS resources_topic_id_idx
    ON resources(topic_id);

COMMIT;
