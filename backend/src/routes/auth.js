const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
/*authentication rate limit */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many authentication attempts. Please try again later.'
    }
});
/*JWT */
function signToken(user){
    return jwt.sign(
        { sub: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' }
    );
}

// Public signup always creates a regular ("user") account.
// Admin accounts are created via the seed script (see backend/src/config/seed.js).

router.post(
    '/signup',
    authLimiter,
    [
        body('name').trim().isLength({ min: 2, max: 10 }).withMessage('Name must be between 2 and characters.'),
        body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
        body('password').isString().isLength({ min: 8, max: 15}).withMessage('Password must be between 8 and 15 characters.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
        }
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
            const token = signToken(user);
            res.status(201).json({  token, user });

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
    '/login',
    authLimiter,
    [
        body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
        body('password').isString().notEmpty().withMessage('Password is required.')
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ error: errors.array()[0].msg});
        }
        const { email, password } = req.body;
        try{
            const normalizedEmail = email.toLowerCase();

            const result = await db.query('SELECT id,name,email,password_hash,role,created_at FROM users WHERE email = $1', [normalizedEmail]);
            const user = result.rows[0];
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const token = signToken(user);
            res.json({
                token,
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
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load profile.' });
    }
});

module.exports = router;