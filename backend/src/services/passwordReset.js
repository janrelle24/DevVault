const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { sendPasswordResetEmail } = require('./mailer');
const { OtpError } = require('./otp');

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const invalidCodeError = () => new OtpError(400, 'Invalid or expired code.');

function generateCode() {
    return crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');
}

// The "reset:" prefix keeps these hashes separate from email-verification hashes.
function hashCode(userId, code) {
    const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
    return crypto.createHmac('sha256', secret).update(`reset:${userId}:${code}`).digest('hex');
}

function codeMatchesHash(storedHash, userId, code) {
    const expected = Buffer.from(storedHash, 'hex');
    const actual = Buffer.from(hashCode(userId, code), 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// Never reveals whether the email exists: it returns quietly if there is no
// account or the resend cooldown is still running.
async function requestPasswordReset(email) {
    const found = await db.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = found.rows[0];
    if (!user) return;

    const code = generateCode();
    const updated = await db.query(
        `UPDATE users
        SET reset_otp_hash = $2,
            reset_otp_expires_at = NOW() + make_interval(mins => $3),
            reset_otp_attempts = 0,
            reset_otp_sent_at = NOW()
        WHERE id = $1
        AND (reset_otp_sent_at IS NULL OR reset_otp_sent_at < NOW() - make_interval(secs => $4))`,
        [user.id, hashCode(user.id, code), CODE_TTL_MINUTES, RESEND_COOLDOWN_SECONDS]
    );
    if (!updated.rowCount) return;

    try {
        await sendPasswordResetEmail(user.email, code, CODE_TTL_MINUTES);
    } catch (err) {
        // Don't leave a usable reset code behind when delivery failed.
        await db.query(
            `UPDATE users
            SET reset_otp_hash = NULL,
                reset_otp_expires_at = NULL,
                reset_otp_attempts = 0,
                reset_otp_sent_at = NULL
            WHERE id = $1 AND reset_otp_hash = $2`,
            [user.id, hashCode(user.id, code)]
        ).catch((cleanupErr) => console.error('Could not clear undelivered password reset code:', cleanupErr));
        throw err;
    }
}

async function resetPasswordWithOtp(email, code, newPassword) {
    const found = await db.query(
        'SELECT id, reset_otp_hash, reset_otp_expires_at, reset_otp_attempts FROM users WHERE email = $1',
        [email.toLowerCase()]
    );
    const user = found.rows[0];
    if (!user || !user.reset_otp_hash || !user.reset_otp_expires_at || new Date(user.reset_otp_expires_at) <= new Date()) {
        throw invalidCodeError();
    }
    if (user.reset_otp_attempts >= MAX_ATTEMPTS) {
        throw new OtpError(429, 'Too many incorrect attempts. Please request a new code.');
    }

    // Increment only while this exact code is active and still has attempts.
    const attempt = await db.query(
        `UPDATE users
        SET reset_otp_attempts = reset_otp_attempts + 1
        WHERE id = $1
            AND reset_otp_hash = $2
            AND reset_otp_expires_at > NOW()
            AND reset_otp_attempts < $3
        RETURNING reset_otp_attempts`,
        [user.id, user.reset_otp_hash, MAX_ATTEMPTS]
    );
    if (!attempt.rowCount) {
        const current = await db.query(
            `SELECT reset_otp_hash, reset_otp_expires_at, reset_otp_attempts
            FROM users WHERE id = $1`,
            [user.id]
        );
        const currentUser = current.rows[0];
        if (currentUser?.reset_otp_hash && currentUser.reset_otp_expires_at > new Date() && currentUser.reset_otp_attempts >= MAX_ATTEMPTS) {
            throw new OtpError(429, 'Too many incorrect attempts. Please request a new code.');
        }
        throw invalidCodeError();
    }
    if (!codeMatchesHash(user.reset_otp_hash, user.id, code)) throw invalidCodeError();

    const passwordHash = await bcrypt.hash(newPassword, 12);
    // Receiving the code at this address also proves the owner controls it,
    // so the email is marked verified.
    const consumed = await db.query(
        `UPDATE users
        SET password_hash = $2,
            email_verified = TRUE,
            reset_otp_hash = NULL,
            reset_otp_expires_at = NULL,
            reset_otp_attempts = 0
        WHERE id = $1
            AND reset_otp_hash = $3
            AND reset_otp_expires_at > NOW()
            AND reset_otp_attempts <= $4`,
        [user.id, passwordHash, user.reset_otp_hash, MAX_ATTEMPTS]
    );
    if (!consumed.rowCount) throw invalidCodeError();
}

module.exports = { CODE_LENGTH, requestPasswordReset, resetPasswordWithOtp };
