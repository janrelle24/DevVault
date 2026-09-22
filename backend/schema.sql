-- DevVault PostgreSQL schema
--
-- Run with:
-- psql -U devvault_user -d devvault -f schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    slug VARCHAR(140) UNIQUE NOT NULL,

    icon VARCHAR(20) DEFAULT '📄',

    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Documents
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    title VARCHAR(200) NOT NULL,

    slug VARCHAR(220) UNIQUE NOT NULL,

    icon VARCHAR(20) DEFAULT '📘',

    description TEXT,

    content JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(content) = 'array'),

    author_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    views INTEGER NOT NULL DEFAULT 0
        CHECK (views >= 0),

    helpful_yes INTEGER NOT NULL DEFAULT 0
        CHECK (helpful_yes >= 0),

    helpful_no INTEGER NOT NULL DEFAULT 0
        CHECK (helpful_no >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Document indexes
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS
idx_documents_category
ON documents(category_id);

CREATE INDEX IF NOT EXISTS
idx_documents_author
ON documents(author_id);

CREATE INDEX IF NOT EXISTS
idx_documents_search
ON documents
USING GIN (
    to_tsvector(
        'english',
        title || ' ' || coalesce(description, '')
    )
);

-- ─────────────────────────────────────────────
-- Tags
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(60) UNIQUE NOT NULL,

    slug VARCHAR(80) UNIQUE NOT NULL
);

-- ─────────────────────────────────────────────
-- Document tags
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_tags (
    document_id UUID
        REFERENCES documents(id)
        ON DELETE CASCADE,

    tag_id UUID
        REFERENCES tags(id)
        ON DELETE CASCADE,

    PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX IF NOT EXISTS
idx_document_tags_tag
ON document_tags(tag_id);

-- ─────────────────────────────────────────────
-- Bookmarks
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,

    document_id UUID
        REFERENCES documents(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS
idx_bookmarks_document
ON bookmarks(document_id);

-- ─────────────────────────────────────────────
-- Recently viewed
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recently_viewed (
    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,

    document_id UUID
        REFERENCES documents(id)
        ON DELETE CASCADE,

    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS
idx_recently_viewed_document
ON recently_viewed(document_id);

CREATE INDEX IF NOT EXISTS
idx_recently_viewed_user_viewed
ON recently_viewed(user_id, viewed_at DESC);

-- ─────────────────────────────────────────────
-- Document feedback
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID
        REFERENCES documents(id)
        ON DELETE CASCADE,

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    helpful BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A logged-in user can submit feedback only once
-- for a particular document.
--
-- Anonymous users have NULL user_id and are handled
-- by application-level rate limiting.

CREATE UNIQUE INDEX IF NOT EXISTS
idx_document_feedback_user_document
ON document_feedback(document_id, user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS
idx_document_feedback_document
ON document_feedback(document_id);

-- ─────────────────────────────────────────────
-- Keep documents.updated_at fresh
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS
trg_documents_updated_at
ON documents;

CREATE TRIGGER
trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();