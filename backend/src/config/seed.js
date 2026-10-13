// backend/src/config/seed.js
require('dotenv').config();

const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const { categories, tags, reactInstallContent, extraDocs } = require('./seedData');

const toSlug = (value) => slugify(value, { lower: true, strict: true });

async function seed() {
    const adminEmailRaw = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmailRaw || !adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.');
    }

    const adminEmail = adminEmailRaw.toLowerCase();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Categories
        const categoryIds = {};
        for (const c of categories) {
            const slug = toSlug(c.name);
            const res = await client.query(
                `INSERT INTO categories (name, slug, icon, sort_order)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    icon = EXCLUDED.icon,
                    sort_order = EXCLUDED.sort_order
                 RETURNING id, slug`,
                [c.name, slug, c.icon, c.sort_order]
            );
            categoryIds[slug] = res.rows[0].id;
        }

        // Tags
        const tagIds = {};
        for (const t of tags) {
            const slug = toSlug(t);
            const res = await client.query(
                `INSERT INTO tags (name, slug) VALUES ($1, $2)
                 ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id, slug`,
                [t, slug]
            );
            tagIds[slug] = res.rows[0].id;
        }

        // Admin user
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
        const adminRes = await client.query(
            `INSERT INTO users (name, email, password_hash, role, email_verified)
             VALUES ($1, $2, $3, 'admin', TRUE)
             ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                role = 'admin',
                email_verified = TRUE
             RETURNING id`,
            [process.env.ADMIN_NAME || 'Admin User', adminEmail, adminPasswordHash]
        );
        const adminId = adminRes.rows[0].id;

        // Demo regular user
        const demoPasswordHash = await bcrypt.hash('password123', 10);
        await client.query(
            `INSERT INTO users (name, email, password_hash, role, email_verified)
             VALUES ($1, $2, $3, 'user', TRUE)
             ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                email_verified = TRUE`,
            ['Demo User', 'demo@devvault.dev', demoPasswordHash]
        );

        // Helper: attach tags to a document
        const attachTags = async (documentId, tagSlugs) => {
            for (const tagSlug of tagSlugs) {
                if (!tagIds[tagSlug]) {
                    console.warn(`⚠️  Unknown tag "${tagSlug}" skipped.`);
                    continue;
                }
                await client.query(
                    `INSERT INTO document_tags (document_id, tag_id) VALUES ($1, $2)
                     ON CONFLICT DO NOTHING`,
                    [documentId, tagIds[tagSlug]]
                );
            }
        };

        // React Installation doc
        const docRes = await client.query(
            `INSERT INTO documents (category_id, title, slug, icon, description, content, author_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (slug) DO UPDATE SET
                content = EXCLUDED.content,
                icon = EXCLUDED.icon,
                updated_at = now()
             RETURNING id`,
            [
                categoryIds['frontend-react'],
                'React Installation',
                'react-installation',
                'react',
                'Step-by-step guide to install and set up React with Vite for a modern and fast development experience.',
                JSON.stringify(reactInstallContent),
                adminId
            ]
        );
        await attachTags(docRes.rows[0].id, ['react', 'vite', 'javascript']);

        // Additional sample docs
        for (const d of extraDocs) {
            if (!categoryIds[d.category]) {
                console.warn(`⚠️  Unknown category "${d.category}" for "${d.title}" (saved without category).`);
            }

            const res = await client.query(
                `INSERT INTO documents (category_id, title, slug, icon, description, content, author_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (slug) DO UPDATE SET
                    category_id = EXCLUDED.category_id,
                    icon = EXCLUDED.icon,
                    content = EXCLUDED.content,
                    updated_at = now()
                 RETURNING id`,
                [
                    categoryIds[d.category] || null,
                    d.title,
                    toSlug(d.title),
                    d.icon,
                    d.description,
                    JSON.stringify(d.content),
                    adminId
                ]
            );
            await attachTags(res.rows[0].id, d.tags);
        }

        await client.query('COMMIT');
        console.log('✅ Seed complete.');
        console.log(`   Admin login: ${adminEmail}`);
        console.log('   Demo login:  demo@devvault.dev / password123');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Run only when executed directly (npm run db:seed), not when imported
if (require.main === module) {
    seed()
        .catch((err) => {
            console.error('❌ Seed failed:', err);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}

module.exports = { seed };