const express = require('express');
const slugify = require('slugify');
const db = require('../config/db');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/documents?search=&category=&tag= - list / search documents
router.get('/', async (req, res) => {
    const { search, category, tag } = req.query;

    try {
        const clauses = [];
        const params = [];

        let sql = `
        SELECT DISTINCT d.id, d.title, d.slug, d.icon, d.description, d.updated_at,
                c.name AS category_name, c.slug AS category_slug
        FROM documents d
        LEFT JOIN categories c ON c.id = d.category_id
        LEFT JOIN document_tags dt ON dt.document_id = d.id
        LEFT JOIN tags t ON t.id = dt.tag_id
        `;

        if (search) {
        params.push(search);
        clauses.push(`to_tsvector('english', d.title || ' ' || coalesce(d.description, ''))
                        @@ plainto_tsquery('english', $${params.length})`);
        }
        if (category) {
        params.push(category);
        clauses.push(`c.slug = $${params.length}`);
        }
        if (tag) {
        params.push(tag);
        clauses.push(`t.slug = $${params.length}`);
        }

        if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
        sql += ' ORDER BY d.updated_at DESC LIMIT 50';

        const result = await db.query(sql, params);
        res.json({ documents: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load documents.' });
    }
});

// GET /api/documents/:slug - full document detail
router.get('/:slug', optionalAuth, async (req, res) => {
    try {
        const docResult = await db.query(
        `SELECT d.*, c.name AS category_name, c.slug AS category_slug
        FROM documents d
        LEFT JOIN categories c ON c.id = d.category_id
        WHERE d.slug = $1`,
        [req.params.slug]
        );
        if (!docResult.rows.length) return res.status(404).json({ error: 'Document not found.' });
        const doc = docResult.rows[0];

        const tagsResult = await db.query(
        `SELECT t.name, t.slug FROM tags t
        JOIN document_tags dt ON dt.tag_id = t.id
        WHERE dt.document_id = $1`,
        [doc.id]
        );

        // Track view count + recently viewed (best-effort, non-blocking)
        db.query('UPDATE documents SET views = views + 1 WHERE id = $1', [doc.id]).catch(() => {});
        if (req.user) {
        db.query(
            `INSERT INTO recently_viewed (user_id, document_id, viewed_at)
            VALUES ($1, $2, now())
            ON CONFLICT (user_id, document_id) DO UPDATE SET viewed_at = now()`,
            [req.user.id, doc.id]
        ).catch(() => {});
        }

        let isBookmarked = false;
        if (req.user) {
        const bm = await db.query(
            'SELECT 1 FROM bookmarks WHERE user_id = $1 AND document_id = $2',
            [req.user.id, doc.id]
        );
        isBookmarked = bm.rows.length > 0;
        }

        res.json({ document: { ...doc, tags: tagsResult.rows, isBookmarked } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load document.' });
    }
});

// POST /api/documents - create a document (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const { title, description, categoryId, icon, content, tagSlugs = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    try {
        const slug = slugify(title, { lower: true, strict: true });
        const result = await db.query(
        `INSERT INTO documents (category_id, title, slug, icon, description, content, author_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [categoryId || null, title, slug, icon || '📄', description || '', JSON.stringify(content || []), req.user.id]
        );
        const doc = result.rows[0];

        if (tagSlugs.length) {
        const tagRows = await db.query('SELECT id, slug FROM tags WHERE slug = ANY($1)', [tagSlugs]);
        for (const t of tagRows.rows) {
            await db.query(
            'INSERT INTO document_tags (document_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [doc.id, t.id]
            );
        }
        }

        res.status(201).json({ document: doc });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') return res.status(409).json({ error: 'A document with this title already exists.' });
        res.status(500).json({ error: 'Could not create document.' });
    }
});

// PATCH /api/documents/:slug - update a document (admin only)
router.patch('/:slug', requireAuth, requireAdmin, async (req, res) => {
    const { title, description, categoryId, icon, content } = req.body;

    try {
        const result = await db.query(
        `UPDATE documents SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category_id = COALESCE($3, category_id),
            icon = COALESCE($4, icon),
            content = COALESCE($5, content)
        WHERE slug = $6
        RETURNING *`,
        [title, description, categoryId, icon, content ? JSON.stringify(content) : null, req.params.slug]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Document not found.' });
        res.json({ document: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update document.' });
    }
});

// DELETE /api/documents/:slug - delete a document (admin only)
router.delete('/:slug', requireAuth, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM documents WHERE slug = $1 RETURNING id', [req.params.slug]);
        if (!result.rows.length) return res.status(404).json({ error: 'Document not found.' });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not delete document.' });
    }
});

// POST /api/documents/:slug/feedback - "Was this helpful?"
router.post('/:slug/feedback', optionalAuth, async (req, res) => {
    const { helpful } = req.body;
    if (typeof helpful !== 'boolean') return res.status(400).json({ error: '"helpful" must be true or false.' });

    try {
        const docResult = await db.query('SELECT id FROM documents WHERE slug = $1', [req.params.slug]);
        if (!docResult.rows.length) return res.status(404).json({ error: 'Document not found.' });
        const docId = docResult.rows[0].id;

        await db.query(
        'INSERT INTO document_feedback (document_id, user_id, helpful) VALUES ($1, $2, $3)',
        [docId, req.user ? req.user.id : null, helpful]
        );
        await db.query(
        `UPDATE documents SET ${helpful ? 'helpful_yes' : 'helpful_no'} = ${helpful ? 'helpful_yes' : 'helpful_no'} + 1
        WHERE id = $1`,
        [docId]
        );

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not record feedback.' });
    }
});

module.exports = router;
