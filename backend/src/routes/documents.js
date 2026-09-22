const express = require('express');
const slugify = require('slugify');
const rateLimit = require('express-rate-limit');

const {
    body,
    param,
    query,
    validationResult
} = require('express-validator');

const db = require('../config/db');

const {
    requireAuth,
    requireAdmin,
    optionalAuth
} = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// Validation helper
// ─────────────────────────────────────────────

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
// Feedback rate limiter
// ─────────────────────────────────────────────

const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many feedback requests. Please try again later.'
    }
});

// ─────────────────────────────────────────────
// GET /api/documents
// Search documents
// ─────────────────────────────────────────────

router.get(
    '/',
    [
        query('search')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Search query is too long.'),

        query('category')
            .optional()
            .trim()
            .isLength({ max: 140 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid category slug.'),

        query('tag')
            .optional()
            .trim()
            .isLength({ max: 80 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid tag slug.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            search,
            category,
            tag
        } = req.query;

        try {
            const clauses = [];
            const params = [];

            let sql = `
                SELECT DISTINCT
                    d.id,
                    d.title,
                    d.slug,
                    d.icon,
                    d.description,
                    d.updated_at,
                    c.name AS category_name,
                    c.slug AS category_slug
                FROM documents d
                LEFT JOIN categories c
                    ON c.id = d.category_id
                LEFT JOIN document_tags dt
                    ON dt.document_id = d.id
                LEFT JOIN tags t
                    ON t.id = dt.tag_id
            `;

            if (search) {
                params.push(search);

                clauses.push(
                    `to_tsvector(
                        'english',
                        d.title || ' ' ||
                        coalesce(d.description, '')
                    )
                    @@ plainto_tsquery(
                        'english',
                        $${params.length}
                    )`
                );
            }

            if (category) {
                params.push(category);

                clauses.push(
                    `c.slug = $${params.length}`
                );
            }

            if (tag) {
                params.push(tag);

                clauses.push(
                    `t.slug = $${params.length}`
                );
            }

            if (clauses.length) {
                sql += ' WHERE ' + clauses.join(' AND ');
            }

            sql += `
                ORDER BY d.updated_at DESC
                LIMIT 50
            `;

            const result = await db.query(sql, params);

            return res.json({
                documents: result.rows
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not load documents.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// GET /api/documents/:slug
// Full document
// ─────────────────────────────────────────────

router.get(
    '/:slug',
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 220 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid document slug.')
    ],
    optionalAuth,
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        try {
            const docResult = await db.query(
                `SELECT
                    d.*,
                    c.name AS category_name,
                    c.slug AS category_slug
                FROM documents d
                LEFT JOIN categories c
                    ON c.id = d.category_id
                WHERE d.slug = $1`,
                [req.params.slug]
            );

            if (!docResult.rows.length) {
                return res.status(404).json({
                    error: 'Document not found.'
                });
            }

            const doc = docResult.rows[0];

            const tagsResult = await db.query(
                `SELECT
                    t.name,
                    t.slug
                FROM tags t
                JOIN document_tags dt
                    ON dt.tag_id = t.id
                WHERE dt.document_id = $1`,
                [doc.id]
            );

            // Best-effort view tracking.
            db.query(
                `UPDATE documents
                SET views = views + 1
                WHERE id = $1`,
                [doc.id]
            ).catch(() => {});

            // Best-effort recently viewed tracking.
            if (req.user) {
                db.query(
                    `INSERT INTO recently_viewed
                        (user_id, document_id, viewed_at)
                    VALUES
                        ($1, $2, now())
                    ON CONFLICT (user_id, document_id)
                    DO UPDATE SET viewed_at = now()`,
                    [
                        req.user.id,
                        doc.id
                    ]
                ).catch(() => {});
            }

            let isBookmarked = false;

            if (req.user) {
                const bookmarkResult = await db.query(
                    `SELECT 1
                    FROM bookmarks
                    WHERE user_id = $1
                    AND document_id = $2`,
                    [
                        req.user.id,
                        doc.id
                    ]
                );

                isBookmarked =
                    bookmarkResult.rows.length > 0;
            }

            return res.json({
                document: {
                    ...doc,
                    tags: tagsResult.rows,
                    isBookmarked
                }
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not load document.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// POST /api/documents
// Admin only
// ─────────────────────────────────────────────

router.post(
    '/',
    requireAuth,
    requireAdmin,
    [
        body('title')
            .isString()
            .trim()
            .isLength({ min: 2, max: 200 })
            .withMessage(
                'Title must be between 2 and 200 characters.'
            ),

        body('description')
            .optional({ nullable: true })
            .isString()
            .isLength({ max: 2000 })
            .withMessage('Description is too long.'),

        body('categoryId')
            .optional({ nullable: true })
            .isUUID()
            .withMessage('Invalid category ID.'),

        body('icon')
            .optional()
            .isString()
            .isLength({ max: 20 })
            .withMessage('Icon is too long.'),

        body('content')
            .optional()
            .isArray()
            .withMessage('Content must be an array.'),

        body('tagSlugs')
            .optional()
            .isArray({ max: 20 })
            .withMessage('Tag list is invalid.'),

        body('tagSlugs.*')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 80 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid tag slug.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            title,
            description,
            categoryId,
            icon,
            content,
            tagSlugs = []
        } = req.body;

        try {
            const slug = slugify(title, {
                lower: true,
                strict: true
            });

            if (!slug) {
                return res.status(400).json({
                    error: 'Could not generate a valid document slug.'
                });
            }

            const result = await db.query(
                `INSERT INTO documents
                    (
                        category_id,
                        title,
                        slug,
                        icon,
                        description,
                        content,
                        author_id
                    )
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [
                    categoryId || null,
                    title,
                    slug,
                    icon || '📄',
                    description || '',
                    JSON.stringify(content || []),
                    req.user.id
                ]
            );

            const doc = result.rows[0];

            if (tagSlugs.length) {
                const tagRows = await db.query(
                    `SELECT id, slug
                    FROM tags
                    WHERE slug = ANY($1)`,
                    [tagSlugs]
                );

                for (const tag of tagRows.rows) {
                    await db.query(
                        `INSERT INTO document_tags
                            (document_id, tag_id)
                        VALUES
                            ($1, $2)
                        ON CONFLICT DO NOTHING`,
                        [
                            doc.id,
                            tag.id
                        ]
                    );
                }
            }

            return res.status(201).json({
                document: doc
            });
        } catch (err) {
            console.error(err);

            if (err.code === '23505') {
                return res.status(409).json({
                    error: 'A document with this title already exists.'
                });
            }

            if (err.code === '23503') {
                return res.status(400).json({
                    error: 'Invalid category or author.'
                });
            }

            return res.status(500).json({
                error: 'Could not create document.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// PATCH /api/documents/:slug
// Admin only
// ─────────────────────────────────────────────

router.patch(
    '/:slug',
    requireAuth,
    requireAdmin,
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 220 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid document slug.'),

        body('title')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 2, max: 200 })
            .withMessage(
                'Title must be between 2 and 200 characters.'
            ),

        body('description')
            .optional({ nullable: true })
            .isString()
            .isLength({ max: 2000 })
            .withMessage('Description is too long.'),

        body('categoryId')
            .optional({ nullable: true })
            .isUUID()
            .withMessage('Invalid category ID.'),

        body('icon')
            .optional()
            .isString()
            .isLength({ max: 20 })
            .withMessage('Icon is too long.'),

        body('content')
            .optional()
            .isArray()
            .withMessage('Content must be an array.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            title,
            description,
            categoryId,
            icon,
            content
        } = req.body;

        try {
            const result = await db.query(
                `UPDATE documents
                SET
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    category_id = COALESCE($3, category_id),
                    icon = COALESCE($4, icon),
                    content = COALESCE($5, content)
                WHERE slug = $6
                 RETURNING *`,
                [
                    title,
                    description,
                    categoryId,
                    icon,
                    content !== undefined
                        ? JSON.stringify(content)
                        : null,
                    req.params.slug
                ]
            );

            if (!result.rows.length) {
                return res.status(404).json({
                    error: 'Document not found.'
                });
            }

            return res.json({
                document: result.rows[0]
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not update document.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// DELETE /api/documents/:slug
// Admin only
// ─────────────────────────────────────────────

router.delete(
    '/:slug',
    requireAuth,
    requireAdmin,
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 220 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid document slug.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        try {
            const result = await db.query(
                `DELETE FROM documents
                WHERE slug = $1
                RETURNING id`,
                [req.params.slug]
            );

            if (!result.rows.length) {
                return res.status(404).json({
                    error: 'Document not found.'
                });
            }

            return res.json({
                ok: true
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not delete document.'
            });
        }
    }
);

// ─────────────────────────────────────────────
// POST /api/documents/:slug/feedback
// ─────────────────────────────────────────────

router.post(
    '/:slug/feedback',
    feedbackLimiter,
    [
        param('slug')
            .trim()
            .isLength({ min: 1, max: 220 })
            .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .withMessage('Invalid document slug.'),

        body('helpful')
            .isBoolean()
            .withMessage(
                '"helpful" must be true or false.'
            )
    ],
    optionalAuth,
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }

        const {
            helpful
        } = req.body;

        try {
            const docResult = await db.query(
                'SELECT id FROM documents WHERE slug = $1',
                [req.params.slug]
            );

            if (!docResult.rows.length) {
                return res.status(404).json({
                    error: 'Document not found.'
                });
            }

            const docId = docResult.rows[0].id;

            // Logged-in users can vote only once per document.
            if (req.user) {
                const existingFeedback = await db.query(
                    `SELECT id
                    FROM document_feedback
                    WHERE document_id = $1
                    AND user_id = $2`,
                    [
                        docId,
                        req.user.id
                    ]
                );

                if (existingFeedback.rows.length) {
                    return res.status(409).json({
                        error: 'You have already submitted feedback for this document.'
                    });
                }
            }

            const client = await db.pool.connect();

            try {
                await client.query('BEGIN');

                await client.query(
                    `INSERT INTO document_feedback
                        (document_id, user_id, helpful)
                    VALUES
                        ($1, $2, $3)`,
                    [
                        docId,
                        req.user ? req.user.id : null,
                        helpful
                    ]
                );

                if (helpful) {
                    await client.query(
                        `UPDATE documents
                            SET helpful_yes = helpful_yes + 1
                            WHERE id = $1`,
                        [docId]
                    );
                } else {
                    await client.query(
                        `UPDATE documents
                            SET helpful_no = helpful_no + 1
                            WHERE id = $1`,
                        [docId]
                    );
                }

                await client.query('COMMIT');

                return res.status(201).json({
                    ok: true
                });
            } catch (err) {
                await client.query('ROLLBACK');

                // Unique constraint violation.
                if (err.code === '23505') {
                    return res.status(409).json({
                        error: 'You have already submitted feedback for this document.'
                    });
                }

                throw err;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Could not record feedback.'
            });
        }
    }
);

module.exports = router;