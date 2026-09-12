const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user){
    return jwt.sign(
        { sub: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// Public signup always creates a regular ("user") account.
// Admin accounts are created via the seed script (see backend/src/config/seed.js).

router.post(
    '/signup',
    [
        body('name').trim().isLength({ min: 8}).withMessage('Name must be at least 8 characters.'),
        body('email').isEmail().withMessage('A valid email is required.'),
        body('password').isLength({ min: 8}).withMessage('Password must be 8 characters.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
        }
        const { name, email, password } = req.body;

        try{
            const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
            if(existing.rows.length){
                return res.status(409).json({ error: 'An account with this email already exists.'});
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const result = await db.query(
                `INSERT INTO users (name, email, password_hash, role)
                VALUES ($1, $2, $3, 'user')
                RETURNING id, name, email, role, created_at`,
                [name, email.toLowerCase(), passwordHash]
            );
            const user = result.rows[0];
            const token = signToken(user);
            res.status(201).json({  token, user });

        }catch(err){
            console.error(err);
            res.status(500).json({  error: 'Could not create account.'});
        }
    }
    
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('A valid email is required.'),
        body('password').notEmpty().withMessage('Password is required.')
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ error: errors.array()[0].msg});
        }
        const { email, password } = req.body;
        try{
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
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