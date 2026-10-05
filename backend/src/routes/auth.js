const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { OTP_LENGTH, OtpError, issueOtp, verifyEmailWithOtp, resendOtp } = require('../services/otp');

const router = express.Router();

const emailRule = body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.');

/*authentication rate limit */
function buildLimiter(message){
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message }
    });
}
const authLimiter = buildLimiter('Too many authentication attempts. Please try again later.');
const otpLimiter = buildLimiter('Too many verification attempts. Please try again later.');

function signToken(user){
    return jwt.sign(
        { sub: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' }
    );
}

function rejectInvalidInput(req, res, next){
    const errors = validationResult(req);
    if(errors.isEmpty()) return next();
    return res.status(400).json({ error: errors.array()[0].msg});
}
function sendOtpError(res, err, fallbackMessage) {
    if (err instanceof OtpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: fallbackMessage });
}

// Public signup always creates a regular ("user") account.
// Admin accounts are created via the seed script (see backend/src/config/seed.js).

router.post(
    '/signup',
    authLimiter,
    [
        body('name').trim().isLength({ min: 2, max: 10 }).withMessage('Name must be between 2 and 10 characters.'),
        emailRule,
        body('password').isString().isLength({ min: 8, max: 15}).withMessage('Password must be between 8 and 15 characters.')
    ],
    rejectInvalidInput,
    async (req, res) => {
        const { name, email, password } = req.body;

        try{
            const normalizedEmail = email.toLowerCase();
            const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
            if(existing.rows.length){
                return res.status(409).json({ error: 'An account with this email already exists.'});
            }
            const passwordHash = await bcrypt.hash(password, 12);
            // IMPORTANT:
            // Public signup can ONLY create a regular user.
            const result = await db.query(
                `INSERT INTO users (name, email, password_hash, role)
                VALUES ($1, $2, $3, 'user')
                RETURNING id, name, email, role, created_at`,
                [name, normalizedEmail, passwordHash]
            );
            const user = result.rows[0];
            await issueOtp(user).catch((err) => console.error('Could not send verification email:', err));
            return res.status(201).json({
                email: user.email,
                message: 'Account created. Check your email for a verification code.'
            });

        }catch(err){
            console.error(err);

            // PostgreSQL unique violation
            if (err.code === '23505') {
                return res.status(409).json({
                    error: 'An account with this email already exists.'
                });
            }

            return res.status(500).json({  error: 'Could not create account.'});
        }
    }
    
);
router.post(
    '/verify-email',
    otpLimiter,
    [
        emailRule,
        body('code', `Enter the ${OTP_LENGTH}-digit code.`)
            .trim()
            .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
            .isNumeric({ no_symbols: true })
    ],
    rejectInvalidInput,
    async (req, res) => {
        try{
            await verifyEmailWithOtp(req.body.email, req.body.code);
            return res.json({ message: 'Email verified. You can now log in.' });
        }catch(err){
            return sendOtpError(res, err, 'Could not verify email.');
        }
    }
)
router.post(
    '/resend-otp',
    otpLimiter,
    [emailRule],
    rejectInvalidInput,
    async (req, res) => {
        try{
            await resendOtp(req.body.email);
            return res.json({ message: 'If an unverified account exists for this email, a new code has been sent.' });
        }catch(err){
            return sendOtpError(res, err, 'Could not send verification code.');
        }
    }
)

router.post(
    '/login',
    authLimiter,
    [
        emailRule,
        body('password').isString().notEmpty().withMessage('Password is required.')
    ],
    rejectInvalidInput,
    async (req, res) =>{
    
        const { email, password } = req.body;
        try{

            const result = await db.query('SELECT id,name,email,password_hash,role,email_verified,created_at FROM users WHERE email = $1', [email.toLowerCase()]);
            const user = result.rows[0];
            
            if(!user || !(await bcrypt.compare(password, user.password_hash))){
                return res.status(401).json({ error: 'Invalid email or password.'});
            }
            if(!user.email_verified){
                await issueOtp(user).catch((err) => {
                    if (!(err instanceof OtpError && err.status === 429)) console.error(err);
                });
                return res.status(403).json({
                    error: 'Please verify your email before logging in.',
                    code: 'EMAIL_NOT_VERIFIED',
                    email: user.email
                })
            }
            return res.json({
                token: signToken(user),
                user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
            });
        }catch(err){
            console.error(err);
            res.status(500).json({ error: 'Could not log in.' });
        }
    }
);


router.get('/me', requireAuth, async (req, res) =>{
    try {
        const result = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
        return res.json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load profile.' });
    }
});

module.exports = router;