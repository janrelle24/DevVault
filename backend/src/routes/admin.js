const express = require('express');
const {
    body,
    param,
    validationResult
} = require('express-validator');

const db = require('../config/db');
const {
    requireAuth,
    requireAdmin
} = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role.
router.use(requireAuth, requireAdmin);

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────

router.get('/stats', async (req, res) => {
    try {
        const [
            userCount,
            docCount,
            categoryCount,
            topDocs
        ] = await Promise.all([
            db.query(
                'SELECT COUNT(*)::int AS count FROM users'
            ),

            db.query(
                'SELECT COUNT(*)::int AS count FROM documents'
            ),

            db.query(
                'SELECT COUNT(*)::int AS count FROM categories'
            ),

            db.query(
                `SELECT id, title, slug, icon, views
                    FROM documents
                    ORDER BY views DESC
                    LIMIT 5`
            )
        ]);

        return res.json({
            stats: {
                userCount: userCount.rows[0].count,
                docCount: docCount.rows[0].count,
                categoryCount: categoryCount.rows[0].count
            },
            topDocuments: topDocs.rows
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: 'Could not load dashboard stats.'
        });
    }
});

// ─────────────────────────────────────────────
// GET /api/admin/documents
// ─────────────────────────────────────────────

router.get('/documents', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                d.id,
                d.title,
                d.slug,
                d.icon,
                d.views,
                d.updated_at,
                c.name AS category_name
                FROM documents d
                LEFT JOIN categories c
                    ON c.id = d.category_id
                ORDER BY d.updated_at DESC`
        );

        return res.json({
            documents: result.rows
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: 'Could not load documents.'
        });
    }
});

// ─────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────

router.get('/users', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                id,
                name,
                email,
                role,
                created_at
                FROM users
                ORDER BY created_at DESC`
        );

        return res.json({
            users: result.rows
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: 'Could not load users.'
        });
    }
});

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:id/role
// ─────────────────────────────────────────────

router.patch(
    '/users/:id/role',
    [
        param('id')
            .isUUID()
            .withMessage('Invalid user ID.'),

        body('role')
            .isIn(['user', 'admin'])
            .withMessage('Role must be "user" or "admin".')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg
            });
        }

        const {
            id
        } = req.params;

        const {
            role
        } = req.body;

        // Prevent an admin from accidentally removing
        // their own admin privileges.
        if (id === req.user.id && role !== 'admin') {
            return res.status(400).json({
                error: 'You cannot remove your own admin role.'
            });
        }

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Lock the user row while changing its role.
            const userResult = await client.query(
                `SELECT id, name, email, role, created_at
                    FROM users
                    WHERE id = $1
                    FOR UPDATE`,
                [id]
            );

            if (!userResult.rows.length) {
                await client.query('ROLLBACK');

                return res.status(404).json({
                    error: 'User not found.'
                });
            }

            const targetUser = userResult.rows[0];

            // Prevent removing the last administrator.
            if (
                targetUser.role === 'admin' &&
                role === 'user'
            ) {
                const adminCountResult = await client.query(
                    `SELECT COUNT(*)::int AS count
                        FROM users
                        WHERE role = 'admin'`
                );

                const adminCount =
                    adminCountResult.rows[0].count;

                if (adminCount <= 1) {
                    await client.query('ROLLBACK');

                    return res.status(400).json({
                        error: 'Cannot remove the last administrator.'
                    });
                }
            }

            const result = await client.query(
                `UPDATE users
                    SET role = $1
                    WHERE id = $2
                    RETURNING id, name, email, role, created_at`,
                [
                    role,
                    id
                ]
            );

            await client.query('COMMIT');

            return res.json({
                user: result.rows[0]
            });
        } catch (err) {
            await client.query('ROLLBACK');

            console.error(err);

            return res.status(500).json({
                error: 'Could not update user role.'
            });
        } finally {
            client.release();
        }
    }
);

module.exports = router;