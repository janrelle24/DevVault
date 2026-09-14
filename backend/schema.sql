-- DevVault PostgreSQL schema
-- Run with: psql -U devvault_user -d devvault -f schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Categories (sidebar groups: Getting Started, Frontend, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(140) UNIQUE NOT NULL,
    icon        VARCHAR(20) DEFAULT '📄',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Documents (the actual doc pages, e.g. "React Installation")
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    title         VARCHAR(200) NOT NULL,
    slug          VARCHAR(220) UNIQUE NOT NULL,
    icon          VARCHAR(20) DEFAULT '📘',
    description   TEXT,
    content       JSONB NOT NULL DEFAULT '[]',  -- array of section blocks (see README)
    author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    views         INTEGER NOT NULL DEFAULT 0,
    helpful_yes   INTEGER NOT NULL DEFAULT 0,
    helpful_no    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents
    USING GIN (to_tsvector('english', title || ' ' || coalesce(description, '')));

-- ─────────────────────────────────────────────
-- Tags + join table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(60) UNIQUE NOT NULL,
    slug  VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

-- ─────────────────────────────────────────────
-- Bookmarks (per-user saved docs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, document_id)
);

-- ─────────────────────────────────────────────
-- Recently viewed (per-user history)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recently_viewed (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, document_id)
);

-- ─────────────────────────────────────────────
-- Feedback ("Was this helpful?")
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_feedback (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    helpful     BOOLEAN NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
