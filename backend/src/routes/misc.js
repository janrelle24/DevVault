const express = require('express');
const slugify = require('slugify');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/tags - list all tags
router.get('/tags', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, slug FROM tags ORDER BY name ASC'
        );

        res.json({ tags: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load tags.' });
    }
});

// POST /api/tags - create a tag (admin only)
router.post(
    '/tags',
    requireAuth,
    requireAdmin,
    [
        body('name')
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage('Tag name must be between 1 and 60 characters.')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg
            });
        }

        const name = req.body.name.trim();
        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        if (!slug) {
            return res.status(400).json({
                error: 'Tag name must contain valid characters.'
            });
        }

        try {
            const result = await db.query(
                `INSERT INTO tags (name, slug)
                 VALUES ($1, $2)
                 RETURNING id, name, slug`,
                [name, slug]
            );

            res.status(201).json({
                tag: result.rows[0]
            });
        } catch (err) {
            if (err.code === '23505') {
                return res.status(409).json({
                    error: 'This tag already exists.'
                });
            }

            console.error(err);
            res.status(500).json({
                error: 'Could not create tag.'
            });
        }
    }
);

// GET /api/recently-viewed - current user's recently viewed docs
router.get('/recently-viewed', requireAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                d.id,
                d.title,
                d.slug,
                d.icon,
                d.description,
                rv.viewed_at
             FROM recently_viewed rv
             JOIN documents d ON d.id = rv.document_id
             WHERE rv.user_id = $1
             ORDER BY rv.viewed_at DESC
             LIMIT 20`,
            [req.user.id]
        );

        res.json({
            documents: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Could not load recently viewed documents.'
        });
    }
});

module.exports = router;