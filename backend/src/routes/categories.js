const express = require('express');
const slugify = require('slugify');

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

function validateRequest(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            error: errors.array()[0].msg
        });

        return false;
    }

    return true;
}

// ─────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                c.id,
                c.name,
                c.slug,
                c.icon,
                c.sort_order,
                COUNT(d.id)::int AS doc_count
            FROM categories c
            LEFT JOIN documents d
                ON d.category_id = c.id
            GROUP BY c.id
            ORDER BY c.sort_order ASC`
        );

        return res.json({
            categories: result.rows
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: 'Could not load categories.'
        });
    }
});

// ─────────────────────────────────────────────
// GET /api/categories/:slug
// ─────────────────────────────────────────────

router.get(
    '/:slug',
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 140 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid category slug.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        try {
            const catResult = await db.query(
                'SELECT * FROM categories WHERE slug = $1',
                [req.params.slug]
            );

            if (!catResult.rows.length) {
                return res.status(404).json({
                    error: 'Category not found.'
                });
            }

            const category = catResult.rows[0];

            const docsResult = await db.query(
                `SELECT
                    id,
                    title,
                    slug,
                    icon,
                    description,
                    updated_at
                FROM documents
                WHERE category_id = $1
                ORDER BY title ASC`,
                [category.id]
            );

            return res.json({
                category,
                documents: docsResult.rows
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not load category.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// POST /api/categories
// Admin only
// ─────────────────────────────────────────────

router.post(
    '/',
    requireAuth,
    requireAdmin,
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage(
                'Category name must be between 2 and 120 characters.'
            ),

        body('icon')
            .optional()
            .isString()
            .isLength({ max: 20 })
            .withMessage('Icon is too long.'),

        body('sortOrder')
            .optional()
            .isInt({ min: 0, max: 10000 })
            .withMessage('Sort order must be a non-negative integer.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            name,
            icon,
            sortOrder
        } = req.body;

        try {
            const slug = slugify(name, {
                lower: true,
                strict: true
            });

            if (!slug) {
                return res.status(400).json({
                    error: 'Could not generate a valid category slug.'
                });
            }

            const result = await db.query(
                `INSERT INTO categories
                    (name, slug, icon, sort_order)
                VALUES
                    ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    name,
                    slug,
                    icon || '📄',
                    sortOrder ?? 0
                ]
            );

            return res.status(201).json({
                category: result.rows[0]
            });
        } catch (err) {
            console.error(err);

            if (err.code === '23505') {
                return res.status(409).json({
                    error: 'A category with this name already exists.'
                });
            }

            return res.status(500).json({
                error: 'Could not create category.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// PATCH /api/categories/:slug
// Admin only
// ─────────────────────────────────────────────

router.patch(
    '/:slug',
    requireAuth,
    requireAdmin,
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 140 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid category slug.'),

        body('name')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage(
                'Category name must be between 2 and 120 characters.'
            ),

        body('icon')
            .optional()
            .isString()
            .isLength({ max: 20 })
            .withMessage('Icon is too long.'),

        body('sortOrder')
            .optional()
            .isInt({ min: 0, max: 10000 })
            .withMessage(
                'Sort order must be a non-negative integer.'
            )
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            name,
            icon,
            sortOrder
        } = req.body;

        const newSlug = name
            ? slugify(name, {
                lower: true,
                strict: true
            })
            : null;

        try {
            if (name && !newSlug) {
                return res.status(400).json({
                    error: 'Could not generate a valid category slug.'
                });
            }

            const result = await db.query(
                `UPDATE categories
                SET
                    name = COALESCE($1, name),
                    slug = COALESCE($2, slug),
                    icon = COALESCE($3, icon),
                    sort_order = COALESCE($4, sort_order)
                WHERE slug = $5
                 RETURNING *`,
                [
                    name,
                    newSlug,
                    icon,
                    sortOrder,
                    req.params.slug
                ]
            );

            if (!result.rows.length) {
                return res.status(404).json({
                    error: 'Category not found.'
                });
            }

            return res.json({
                category: result.rows[0]
            });
        } catch (err) {
            console.error(err);

            if (err.code === '23505') {
                return res.status(409).json({
                    error: 'A category with this name already exists.'
                });
            }

            return res.status(500).json({
                error: 'Could not update category.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// DELETE /api/categories/:slug
// Admin only
// ─────────────────────────────────────────────

router.delete(
    '/:slug',
    requireAuth,
    requireAdmin,
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 140 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid category slug.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        try {
            const result = await db.query(
                `DELETE FROM categories
                WHERE slug = $1
                RETURNING id`,
                [req.params.slug]
            );

            if (!result.rows.length) {
                return res.status(404).json({
                    error: 'Category not found.'
                });
            }

            return res.json({
                ok: true
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not delete category.'
            });
        }
    }
);

module.exports = router;