ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS otp_hash TEXT,
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS otp_sent_at TIMESTAMPTZ;

-- Existing rows keep TRUE (already-registered users stay verified); new rows start unverified.
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;
