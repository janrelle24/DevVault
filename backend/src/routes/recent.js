const express = require('express');

const { param, validationResult } = require('express-validator');

const db = require('../config/db');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Validation helper

function validateRequest(req, res) {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg }); 
        return false; 
    } 
    return true;
}
// GET /api/recent 
// // Get recently viewed documents
router.get(
    '/',
    requireAuth,
    async (req, res) =>{
        try{
            const result = await db.query(
                `SELECT 
                    d.id, d.title, d.slug, d.icon, d.description, d.updated_at, rv.viewed_at, c.name AS category_name, c.slug AS category_slug 
                    FROM recently_viewed rv 
                    JOIN documents d 
                        ON d.id = rv.document_id 
                    LEFT JOIN categories c 
                        ON c.id = d.category_id 
                    WHERE rv.user_id = $1 
                    ORDER BY rv.viewed_at DESC 
                    LIMIT 20`, [ req.user.id ]
            );
            return res.json({ 
                documents: result.rows 
            });   
        }catch(err){
            console.error(err);
            return res.status(500).json({ 
                error: 'Could not load recently viewed documents.' 
            });
        }
    }
    
);

// DELETE /api/recent 
// // Clear all recently viewed documents
router.delete(
    '/',
    requireAuth,
    async (req, res) => {
        try{
            await db.query(
                `DELETE FROM recently_viewed 
                    WHERE user_id = $1`,
                    [ req.user.id ]
            );
            return res.json({ 
                ok: true 
            });
        }catch(err){
            console.error(err);
            return res.status(500).json({ 
                error: 'Could not clear recently viewed documents.'
            });
        }
    }
);
// DELETE /api/recent/:documentId 
// // Remove one recently viewed 
router.delete(
    '/:documentId',
    requireAuth,
    [
        param('documentId')
            .isUUID()
            .withMessage('Invalid document ID.')
    ],
    async (req, res) => {
        if (!validateRequest(req, res)) {
            return;
        }
        try{
            const result = await db.query(
                `DELETE FROM recently_viewed 
                WHERE user_id = $1 AND document_id = $2 
                RETURNING document_id`,
                [ 
                    req.user.id, req.params.documentId
                ]
            );
            if(!result.rows.length){
                return res.status(404).json({
                    error: 'Recently viewed document not found.' 
                });
            }
            return res.json({
                ok: true 
            });
        }catch (err){
            console.error(err);
            return res.status(500).json({ 
                error: 'Could not remove recently viewed document.'
            });
        }
    }
);
module.exports = router;