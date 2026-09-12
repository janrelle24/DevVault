const express = require('express');
const slugify = require('slugify');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - list all categories with doc counts
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
        SELECT c.id, c.name, c.slug, c.icon, c.sort_order,
                COUNT(d.id)::int AS doc_count
        FROM categories c
        LEFT JOIN documents d ON d.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC
        `);
        res.json({ categories: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load categories.' });
    }
});

// GET /api/categories/:slug - category with its documents
router.get('/:slug', async (req, res) => {
    try {
        const catResult = await db.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
        if (!catResult.rows.length) return res.status(404).json({ error: 'Category not found.' });
        const category = catResult.rows[0];

        const docsResult = await db.query(
        `SELECT id, title, slug, icon, description, updated_at
        FROM documents WHERE category_id = $1 ORDER BY title ASC`,
        [category.id]
        );

        res.json({ category, documents: docsResult.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load category.' });
    }
});

// POST /api/categories - create a category (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const { name, icon, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    try {
        const slug = slugify(name, { lower: true, strict: true });
        const result = await db.query(
        `INSERT INTO categories (name, slug, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, slug, icon || '📄', sortOrder || 0]
        );
        res.status(201).json({ category: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'A category with this name already exists.' });
        console.error(err);
        res.status(500).json({ error: 'Could not create category.' });
    }
});

// PATCH /api/categories/:slug - update a category (admin only)
router.patch('/:slug', requireAuth, requireAdmin, async (req, res) => {
    const { name, icon, sortOrder } = req.body;
    const newSlug = name ? slugify(name, { lower: true, strict: true }) : null;

    try {
        const result = await db.query(
        `UPDATE categories SET
            name = COALESCE($1, name),
            slug = COALESCE($2, slug),
            icon = COALESCE($3, icon),
            sort_order = COALESCE($4, sort_order)
        WHERE slug = $5
        RETURNING *`,
        [name, newSlug, icon, sortOrder, req.params.slug]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Category not found.' });
        res.json({ category: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update category.' });
    }
});

// DELETE /api/categories/:slug - delete a category (admin only)
router.delete('/:slug', requireAuth, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM categories WHERE slug = $1 RETURNING id', [req.params.slug]);
        if (!result.rows.length) return res.status(404).json({ error: 'Category not found.' });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not delete category.' });
    }
});

module.exports = router;
