const crypto = require('crypto');
const db = require('../config/db');
const { sendOtpEmail } = require('./mailer');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

class OtpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const invalidCodeError = () => new OtpError(400, 'Invalid or expired code.');

function generateCode() {
    return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
}

function hashCode(userId, code) {
    const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
    return crypto.createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
}

function codeMatchesHash(storedHash, userId, code) {
    const expected = Buffer.from(storedHash, 'hex');
    const actual = Buffer.from(hashCode(userId, code), 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function findUserByEmail(email) {
    const result = await db.query(
        `SELECT id, email, email_verified, otp_hash, otp_expires_at
        FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );
    return result.rows[0];
}

async function issueOtp(user) {
    const code = generateCode();
    const result = await db.query(
        `UPDATE users
        SET otp_hash = $2,
            otp_expires_at = NOW() + make_interval(mins => $3),
            otp_attempts = 0,
            otp_sent_at = NOW()
        WHERE id = $1
        AND (otp_sent_at IS NULL OR otp_sent_at < NOW() - make_interval(secs => $4))`,
        [user.id, hashCode(user.id, code), OTP_TTL_MINUTES, OTP_RESEND_COOLDOWN_SECONDS]
    );
    if (!result.rowCount) {
        throw new OtpError(429, `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new code.`);
    }
    await sendOtpEmail(user.email, code, OTP_TTL_MINUTES);
}

async function consumeAttempt(userId) {
    const result = await db.query(
        'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1 RETURNING otp_attempts',
        [userId]
    );
    if (result.rows[0].otp_attempts > OTP_MAX_ATTEMPTS) {
        throw new OtpError(429, 'Too many incorrect attempts. Please request a new code.');
    }
}

async function markEmailVerified(userId) {
    await db.query(
        `UPDATE users
        SET email_verified = TRUE, otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0
        WHERE id = $1`,
        [userId]
    );
}

async function verifyEmailWithOtp(email, code) {
    const user = await findUserByEmail(email);
    if (!user) throw invalidCodeError();
    if (user.email_verified) throw new OtpError(400, 'Email is already verified. Please log in.');
    if (!user.otp_hash || user.otp_expires_at < new Date()) throw invalidCodeError();

    await consumeAttempt(user.id);
    if (!codeMatchesHash(user.otp_hash, user.id, code)) throw invalidCodeError();

    await markEmailVerified(user.id);
}

async function resendOtp(email) {
    const user = await findUserByEmail(email);
    if (!user || user.email_verified) return;
    await issueOtp(user);
}

module.exports = { OTP_LENGTH, OtpError, issueOtp, verifyEmailWithOtp, resendOtp };