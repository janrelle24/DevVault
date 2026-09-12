const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All bookmark routes require auth
router.use(requireAuth);

// GET /api/bookmarks - list current user's bookmarks
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
        `SELECT d.id, d.title, d.slug, d.icon, d.description, b.created_at AS bookmarked_at
        FROM bookmarks b
        JOIN documents d ON d.id = b.document_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC`,
        [req.user.id]
        );
        res.json({ bookmarks: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load bookmarks.' });
    }
});

// POST /api/bookmarks/:slug - add a bookmark
router.post('/:slug', async (req, res) => {
    try {
        const docResult = await db.query('SELECT id FROM documents WHERE slug = $1', [req.params.slug]);
        if (!docResult.rows.length) return res.status(404).json({ error: 'Document not found.' });

        await db.query(
        `INSERT INTO bookmarks (user_id, document_id) VALUES ($1, $2)
        ON CONFLICT DO NOTHING`,
        [req.user.id, docResult.rows[0].id]
        );
        res.status(201).json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not add bookmark.' });
    }
});

// DELETE /api/bookmarks/:slug - remove a bookmark
router.delete('/:slug', async (req, res) => {
    try {
        const docResult = await db.query('SELECT id FROM documents WHERE slug = $1', [req.params.slug]);
        if (!docResult.rows.length) return res.status(404).json({ error: 'Document not found.' });

        await db.query('DELETE FROM bookmarks WHERE user_id = $1 AND document_id = $2', [
        req.user.id,
        docResult.rows[0].id
        ]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not remove bookmark.' });
    }
});

module.exports = router;
