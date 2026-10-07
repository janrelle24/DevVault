const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const mailer = require('../src/services/mailer');

const user = {
    id: 1,
    email: 'person@example.com',
    password_hash: 'old-password-hash',
    email_verified: false,
    reset_otp_hash: null,
    reset_otp_expires_at: null,
    reset_otp_attempts: 0,
    reset_otp_sent_at: null
};

let state;
let deliveredCode;
let failDelivery;
let accountExists;

db.query = async (sql, params = []) => {
    if (sql.includes('SELECT id, email FROM users')) {
        return { rows: accountExists ? [{ id: state.id, email: state.email }] : [] };
    }
    if (sql.includes('SELECT id, reset_otp_hash')) {
        return { rows: [{ ...state }] };
    }
    if (sql.includes('SELECT reset_otp_hash, reset_otp_expires_at')) {
        const { reset_otp_hash, reset_otp_expires_at, reset_otp_attempts } = state;
        return { rows: [{ reset_otp_hash, reset_otp_expires_at, reset_otp_attempts }] };
    }
    if (sql.includes('SET reset_otp_hash = $2')) {
        state.reset_otp_hash = params[1];
        state.reset_otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
        state.reset_otp_attempts = 0;
        state.reset_otp_sent_at = new Date();
        return { rowCount: 1, rows: [] };
    }
    if (sql.includes('SET reset_otp_hash = NULL')) {
        if (state.id !== params[0] || state.reset_otp_hash !== params[1]) return { rowCount: 0, rows: [] };
        state.reset_otp_hash = null;
        state.reset_otp_expires_at = null;
        state.reset_otp_attempts = 0;
        state.reset_otp_sent_at = null;
        return { rowCount: 1, rows: [] };
    }
    if (sql.includes('SET reset_otp_attempts = reset_otp_attempts + 1')) {
        if (state.id !== params[0] || state.reset_otp_hash !== params[1] ||
            state.reset_otp_expires_at <= new Date() || state.reset_otp_attempts >= params[2]) {
            return { rowCount: 0, rows: [] };
        }
        state.reset_otp_attempts += 1;
        return { rowCount: 1, rows: [{ reset_otp_attempts: state.reset_otp_attempts }] };
    }
    if (sql.includes('SET password_hash = $2')) {
        if (state.id !== params[0] || state.reset_otp_hash !== params[2] ||
            state.reset_otp_expires_at <= new Date() || state.reset_otp_attempts > params[3]) {
            return { rowCount: 0, rows: [] };
        }
        state.password_hash = params[1];
        state.email_verified = true;
        state.reset_otp_hash = null;
        state.reset_otp_expires_at = null;
        state.reset_otp_attempts = 0;
        return { rowCount: 1, rows: [] };
    }
    throw new Error(`Unexpected SQL in test: ${sql}`);
};

mailer.sendPasswordResetEmail = async (_email, code) => {
    if (failDelivery) throw new Error('SMTP unavailable');
    deliveredCode = code;
};

const { requestPasswordReset, resetPasswordWithOtp } = require('../src/services/passwordReset');

beforeEach(() => {
    state = { ...user };
    deliveredCode = null;
    failDelivery = false;
    accountExists = true;
});

test('unknown email produces no reset email or stored code', async () => {
    accountExists = false;

    await requestPasswordReset(user.email);

    assert.equal(deliveredCode, null);
    assert.equal(state.reset_otp_hash, null);
});

test('reset code is stored hashed and successful reset consumes it', async () => {
    await requestPasswordReset(user.email);
    assert.ok(deliveredCode);
    assert.notEqual(state.reset_otp_hash, deliveredCode);

    await resetPasswordWithOtp(user.email, deliveredCode, 'a-longer-new-password');

    assert.equal(await bcrypt.compare('a-longer-new-password', state.password_hash), true);
    assert.equal(state.email_verified, true);
    assert.equal(state.reset_otp_hash, null);
});

test('the same code cannot be consumed by concurrent reset requests', async () => {
    await requestPasswordReset(user.email);
    const results = await Promise.allSettled([
        resetPasswordWithOtp(user.email, deliveredCode, 'new-password-one'),
        resetPasswordWithOtp(user.email, deliveredCode, 'new-password-two')
    ]);

    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
});

test('reset attempts are capped at five', async () => {
    await requestPasswordReset(user.email);
    const wrongCode = String((Number(deliveredCode) + 1) % 1_000_000).padStart(6, '0');
    for (let i = 0; i < 5; i += 1) {
        await assert.rejects(resetPasswordWithOtp(user.email, wrongCode, 'new-password'), { status: 400 });
    }

    await assert.rejects(resetPasswordWithOtp(user.email, wrongCode, 'new-password'), { status: 429 });
    assert.equal(state.reset_otp_attempts, 5);
});

test('expired reset codes are rejected without consuming an attempt', async () => {
    await requestPasswordReset(user.email);
    state.reset_otp_expires_at = new Date(Date.now() - 1000);

    await assert.rejects(resetPasswordWithOtp(user.email, deliveredCode, 'new-password'), { status: 400 });
    assert.equal(state.reset_otp_attempts, 0);
});

test('failed email delivery clears the undelivered reset code', async () => {
    failDelivery = true;

    await assert.rejects(requestPasswordReset(user.email), /SMTP unavailable/);

    assert.equal(state.reset_otp_hash, null);
    assert.equal(state.reset_otp_expires_at, null);
    assert.equal(state.reset_otp_sent_at, null);
});
