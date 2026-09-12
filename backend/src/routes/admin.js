const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats - dashboard summary
router.get('/stats', async (req, res) => {
    try {
        const [userCount, docCount, categoryCount, topDocs] = await Promise.all([
            db.query('SELECT COUNT(*)::int AS count FROM users'),
            db.query('SELECT COUNT(*)::int AS count FROM documents'),
            db.query('SELECT COUNT(*)::int AS count FROM categories'),
            db.query('SELECT id, title, slug, icon, views FROM documents ORDER BY views DESC LIMIT 5')
        ]);

        res.json({
        stats: {
            userCount: userCount.rows[0].count,
            docCount: docCount.rows[0].count,
            categoryCount: categoryCount.rows[0].count
        },
        topDocuments: topDocs.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load dashboard stats.' });
    }
    });

    // GET /api/admin/documents - all documents (for the admin table)
    router.get('/documents', async (req, res) => {
    try {
        const result = await db.query(`
        SELECT d.id, d.title, d.slug, d.icon, d.views, d.updated_at,
                c.name AS category_name
        FROM documents d
        LEFT JOIN categories c ON c.id = d.category_id
        ORDER BY d.updated_at DESC
        `);
        res.json({ documents: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load documents.' });
    }
    });

    // GET /api/admin/users - list users
    router.get('/users', async (req, res) => {
    try {
        const result = await db.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load users.' });
    }
    });

    // PATCH /api/admin/users/:id/role - promote/demote a user
    router.patch('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Role must be "user" or "admin".' });

    try {
        const result = await db.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, created_at',
        [role, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update user role.' });
    }
});

module.exports = router;
