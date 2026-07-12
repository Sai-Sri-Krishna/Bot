-- =============================================================
-- NEC AI Voice Assistant — PostgreSQL Schema
-- Version: V1 — Initial Schema
-- Uses BIGSERIAL (bigint auto-increment) to match Hibernate Long IDs
-- =============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ADMIN',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FAQ Entries
CREATE TABLE IF NOT EXISTS faq_entries (
    id          BIGSERIAL PRIMARY KEY,
    question    TEXT        NOT NULL,
    answer      TEXT        NOT NULL,
    category    VARCHAR(100) NOT NULL DEFAULT 'Admissions',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FAQ Aliases (many-to-one with faq_entries)
CREATE TABLE IF NOT EXISTS faq_aliases (
    id            BIGSERIAL PRIMARY KEY,
    faq_entry_id  BIGINT NOT NULL REFERENCES faq_entries(id) ON DELETE CASCADE,
    alias_text    TEXT NOT NULL
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_guest    BOOLEAN NOT NULL DEFAULT FALSE,
    started_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender          VARCHAR(20) NOT NULL,
    text            TEXT NOT NULL,
    source          VARCHAR(30),
    matched_faq_id  BIGINT REFERENCES faq_entries(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faq_aliases_entry    ON faq_aliases(faq_entry_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user   ON chat_sessions(user_id);
