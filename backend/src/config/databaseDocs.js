// backend/src/config/databaseDocs.js
// Database learning notes. Category: 'database'

module.exports = [
    {
        category: 'database',
        title: 'SQL Basics: CRUD Queries',
        icon: 'postgresql',
        description: 'The four core SQL operations: create, read, update, and delete rows.',
        content: [
            {
                type: 'section',
                heading: '1. INSERT: create a row',
                text: 'Add a new row to a table. RETURNING gives you the saved row back.',
                code: {
                    lang: 'sql',
                    value: `INSERT INTO categories (name, slug, icon)
VALUES ('Database', 'database', 'postgresql')
RETURNING *;`
                }
            },
            {
                type: 'section',
                heading: '2. SELECT: read rows',
                text: 'Choose columns, filter with WHERE, sort with ORDER BY, and limit the result.',
                code: {
                    lang: 'sql',
                    value: `SELECT id, title, slug
FROM documents
WHERE category_id = 2
ORDER BY created_at DESC
LIMIT 10;`
                }
            },
            {
                type: 'section',
                heading: '3. UPDATE: change rows',
                text: 'Always include a WHERE clause, otherwise every row is updated.',
                code: {
                    lang: 'sql',
                    value: `UPDATE documents
SET title = 'React Installation Guide', updated_at = now()
WHERE slug = 'react-installation';`
                }
            },
            {
                type: 'section',
                heading: '4. DELETE: remove rows',
                text: 'Like UPDATE, a DELETE without WHERE removes everything.',
                code: {
                    lang: 'sql',
                    value: `DELETE FROM documents
WHERE id = 5;`
                },
                callout: { tone: 'success', text: 'Tip: run your WHERE clause as a SELECT first to confirm which rows it matches.' }
            },
            {
                type: 'section',
                heading: '5. Filtering helpers',
                text: 'Common operators for the WHERE clause.',
                code: {
                    lang: 'sql',
                    value: `WHERE role = 'admin'
WHERE created_at > now() - interval '7 days'
WHERE title ILIKE '%react%'
WHERE category_id IN (1, 2, 3)
WHERE description IS NULL
WHERE role = 'user' AND email_verified = TRUE`
                }
            },
            {
                type: 'section',
                heading: '6. Aggregates',
                text: 'Count, group, and summarize rows.',
                code: {
                    lang: 'sql',
                    value: `SELECT category_id, COUNT(*) AS total
FROM documents
GROUP BY category_id
ORDER BY total DESC;`
                }
            }
        ],
        tags: ['postgresql', 'sql']
    },
    {
        category: 'database',
        title: 'Creating Tables & Relationships',
        icon: 'postgresql',
        description: 'Design tables with primary keys, foreign keys, and a many-to-many join table.',
        content: [
            {
                type: 'section',
                heading: '1. Create a table',
                text: 'Each column has a name, a type, and optional constraints. SERIAL creates an auto-incrementing id.',
                code: {
                    lang: 'sql',
                    value: `CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0
);`
                }
            },
            {
                type: 'section',
                heading: '2. One-to-many with a foreign key',
                text: 'One category has many documents. The foreign key lives on the "many" side.',
                code: {
                    lang: 'sql',
                    value: `CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    content JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);`
                }
            },
            {
                type: 'section',
                heading: '3. Many-to-many with a join table',
                text: 'A document has many tags and a tag belongs to many documents. A join table links them, and the composite primary key prevents duplicate pairs.',
                code: {
                    lang: 'sql',
                    value: `CREATE TABLE document_tags (
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);`
                }
            },
            {
                type: 'section',
                heading: '4. ON DELETE options',
                text: 'Choose what happens to child rows when the parent row is deleted.',
                code: {
                    lang: 'text',
                    value: `CASCADE      delete the child rows too
SET NULL     keep the child, clear the foreign key
RESTRICT     block the delete`
                }
            },
            {
                type: 'section',
                heading: '5. Change an existing table',
                text: 'Use ALTER TABLE to add, rename, or drop columns.',
                code: {
                    lang: 'sql',
                    value: `ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users RENAME COLUMN name TO full_name;
ALTER TABLE users DROP COLUMN avatar_url;`
                },
                callout: { tone: 'success', text: 'The example schema above is simplified. Check your own migrate.js for the exact definitions.' }
            }
        ],
        tags: ['postgresql', 'sql']
    },
    {
        category: 'database',
        title: 'Connect Node.js to PostgreSQL with pg',
        icon: 'postgresql',
        description: 'Create a connection pool and run queries from your Express backend.',
        content: [
            {
                type: 'section',
                heading: '1. Install pg',
                text: 'The pg package is the PostgreSQL client for Node.js.',
                code: { lang: 'bash', value: 'npm install pg' }
            },
            {
                type: 'section',
                heading: '2. Add DATABASE_URL to .env',
                text: 'The connection string contains the user, password, host, port, and database name.',
                code: {
                    lang: 'text',
                    value: 'DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/devvault'
                }
            },
            {
                type: 'section',
                heading: '3. Create a Pool',
                text: 'A pool reuses connections instead of opening a new one for every query. Create it once and export it.',
                code: {
                    lang: 'javascript',
                    value: `require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = { pool };`
                }
            },
            {
                type: 'section',
                heading: '4. Run a query',
                text: 'pool.query() returns an object. The rows live in result.rows.',
                code: {
                    lang: 'javascript',
                    value: `const result = await pool.query('SELECT * FROM categories ORDER BY sort_order');

console.log(result.rows);`
                }
            },
            {
                type: 'section',
                heading: '5. Use it in a route',
                text: 'Return the rows as JSON.',
                code: {
                    lang: 'javascript',
                    value: `router.get('/categories', async (req, res) => {
    const result = await pool.query('SELECT * FROM categories ORDER BY sort_order');
    res.json(result.rows);
});`
                },
                callout: { tone: 'success', text: 'Managed hosts such as Neon, Supabase, and Render require SSL, which is what the ssl option is for.' }
            }
        ],
        tags: ['postgresql', 'nodejs', 'api']
    },
    {
        category: 'database',
        title: 'Parameterized Queries & SQL Injection',
        icon: 'postgresql',
        description: 'Prevent SQL injection by never building queries from raw user input.',
        content: [
            {
                type: 'section',
                heading: '1. What is SQL injection?',
                text: 'If you paste user input directly into a SQL string, an attacker can change the meaning of your query and read or delete data.'
            },
            {
                type: 'section',
                heading: '2. The dangerous way',
                text: 'Never build a query by joining strings with user input.',
                code: {
                    lang: 'javascript',
                    value: `// DON'T DO THIS
const sql = "SELECT * FROM users WHERE email = '" + email + "'";
await pool.query(sql);`
                }
            },
            {
                type: 'section',
                heading: '3. The safe way',
                text: 'Use placeholders ($1, $2, ...) and pass the values as an array. The database treats them strictly as data.',
                code: {
                    lang: 'javascript',
                    value: `const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);`
                }
            },
            {
                type: 'section',
                heading: '4. Multiple parameters',
                text: 'The numbers match the position in the array.',
                code: {
                    lang: 'javascript',
                    value: `await pool.query(
    'INSERT INTO tags (name, slug) VALUES ($1, $2)',
    [name, slug]
);`
                }
            },
            {
                type: 'section',
                heading: '5. Placeholders only work for values',
                text: 'You cannot use a placeholder for a table or column name. If you must sort by a user-selected column, check it against an allow-list first.',
                code: {
                    lang: 'javascript',
                    value: `const allowedSort = ['title', 'created_at'];
const sortBy = allowedSort.includes(req.query.sort) ? req.query.sort : 'created_at';

const result = await pool.query('SELECT * FROM documents ORDER BY ' + sortBy + ' DESC');`
                },
                callout: { tone: 'success', text: 'Rule of thumb: every user-provided value goes through a placeholder, no exceptions.' }
            }
        ],
        tags: ['postgresql', 'security', 'sql']
    },
    {
        category: 'database',
        title: 'SQL Joins & Fetching Related Data',
        icon: 'postgresql',
        description: 'Combine tables to fetch documents with their categories and tags.',
        content: [
            {
                type: 'section',
                heading: '1. INNER JOIN',
                text: 'Returns only rows that have a match in both tables.',
                code: {
                    lang: 'sql',
                    value: `SELECT d.title, c.name AS category
FROM documents d
INNER JOIN categories c ON c.id = d.category_id;`
                }
            },
            {
                type: 'section',
                heading: '2. LEFT JOIN',
                text: 'Keeps every row from the left table, even if there is no match. Documents without a category still appear, with a NULL category.',
                code: {
                    lang: 'sql',
                    value: `SELECT d.title, c.name AS category
FROM documents d
LEFT JOIN categories c ON c.id = d.category_id;`
                }
            },
            {
                type: 'section',
                heading: '3. Join through a many-to-many table',
                text: 'Go from documents, through document_tags, to tags.',
                code: {
                    lang: 'sql',
                    value: `SELECT d.title, t.name AS tag
FROM documents d
JOIN document_tags dt ON dt.document_id = d.id
JOIN tags t ON t.id = dt.tag_id
WHERE t.slug = 'react';`
                }
            },
            {
                type: 'section',
                heading: '4. Collect tags into one array',
                text: 'array_agg() groups the related rows into a single array per document.',
                code: {
                    lang: 'sql',
                    value: `SELECT d.id, d.title, array_agg(t.name) AS tags
FROM documents d
LEFT JOIN document_tags dt ON dt.document_id = d.id
LEFT JOIN tags t ON t.id = dt.tag_id
GROUP BY d.id;`
                }
            },
            {
                type: 'section',
                heading: '5. Count documents per category',
                text: 'Useful for the sidebar counters.',
                code: {
                    lang: 'sql',
                    value: `SELECT c.name, COUNT(d.id) AS total
FROM categories c
LEFT JOIN documents d ON d.category_id = c.id
GROUP BY c.id
ORDER BY c.sort_order;`
                },
                callout: { tone: 'success', text: 'Use LEFT JOIN when you want to keep rows that have no related data, such as empty categories.' }
            }
        ],
        tags: ['postgresql', 'sql']
    },
    {
        category: 'database',
        title: 'PostgreSQL Transactions',
        icon: 'postgresql',
        description: 'Group several queries so they all succeed together or all fail together.',
        content: [
            {
                type: 'section',
                heading: '1. Why transactions?',
                text: 'If you insert a document and then fail while adding its tags, you do not want half the data saved. A transaction makes the whole group atomic.'
            },
            {
                type: 'section',
                heading: '2. The three commands',
                text: 'BEGIN starts the transaction, COMMIT saves it, and ROLLBACK cancels everything since BEGIN.',
                code: {
                    lang: 'sql',
                    value: `BEGIN;
-- queries here
COMMIT;   -- or ROLLBACK;`
                }
            },
            {
                type: 'section',
                heading: '3. Use a transaction in Node.js',
                text: 'A transaction must run on a single connection, so check out a client from the pool instead of using pool.query().',
                code: {
                    lang: 'javascript',
                    value: `const client = await pool.connect();

try {
    await client.query('BEGIN');

    const doc = await client.query(
        'INSERT INTO documents (title, slug) VALUES ($1, $2) RETURNING id',
        [title, slug]
    );

    await client.query(
        'INSERT INTO document_tags (document_id, tag_id) VALUES ($1, $2)',
        [doc.rows[0].id, tagId]
    );

    await client.query('COMMIT');
} catch (err) {
    await client.query('ROLLBACK');
    throw err;
} finally {
    client.release();
}`
                },
                callout: { tone: 'success', text: 'Always release the client in finally, otherwise your pool will eventually run out of connections. Your seed script uses this exact pattern.' }
            }
        ],
        tags: ['postgresql', 'nodejs', 'sql']
    },
    {
        category: 'database',
        title: 'Indexes & Searching Documents',
        icon: 'postgresql',
        description: 'Speed up queries with indexes and build search with ILIKE and full-text search.',
        content: [
            {
                type: 'section',
                heading: '1. What is an index?',
                text: 'An index lets PostgreSQL find rows without scanning the whole table. Primary keys and UNIQUE columns are indexed automatically.'
            },
            {
                type: 'section',
                heading: '2. Index foreign keys',
                text: 'Foreign key columns are not indexed automatically. Index the ones you filter or join on often.',
                code: {
                    lang: 'sql',
                    value: `CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_document_tags_tag ON document_tags(tag_id);`
                }
            },
            {
                type: 'section',
                heading: '3. Simple search with ILIKE',
                text: 'ILIKE is a case-insensitive match. Pass the pattern as a parameter, never by string concatenation inside the SQL.',
                code: {
                    lang: 'javascript',
                    value: `const result = await pool.query(
    'SELECT id, title, slug FROM documents WHERE title ILIKE $1 OR description ILIKE $1',
    ['%' + search + '%']
);`
                }
            },
            {
                type: 'section',
                heading: '4. Full-text search',
                text: 'Full-text search understands words and ignores filler words, which gives better results than ILIKE for longer text.',
                code: {
                    lang: 'sql',
                    value: `SELECT id, title
FROM documents
WHERE to_tsvector('english', title || ' ' || coalesce(description, ''))
      @@ plainto_tsquery('english', 'react router');`
                }
            },
            {
                type: 'section',
                heading: '5. Index for full-text search',
                text: 'A GIN index makes full-text search fast on larger tables.',
                code: {
                    lang: 'sql',
                    value: `CREATE INDEX idx_documents_search ON documents
USING GIN (to_tsvector('english', title || ' ' || coalesce(description, '')));`
                },
                callout: { tone: 'success', text: 'For a personal docs site, ILIKE is plenty. Move to full-text search when the table grows.' }
            }
        ],
        tags: ['postgresql', 'sql', 'api']
    },
    {
        category: 'database',
        title: 'Useful psql Commands',
        icon: 'postgresql',
        description: 'Command-line shortcuts for exploring and managing your PostgreSQL databases.',
        content: [
            {
                type: 'section',
                heading: '1. Connect',
                text: 'Open the psql shell as a user, or connect directly to a database.',
                code: {
                    lang: 'bash',
                    value: `psql -U postgres
psql -U postgres -d devvault
psql "postgresql://user:password@host:5432/devvault"`
                }
            },
            {
                type: 'section',
                heading: '2. Navigation commands',
                text: 'These commands start with a backslash and do not need a semicolon.',
                code: {
                    lang: 'text',
                    value: `\\l            list databases
\\c devvault   connect to a database
\\dt           list tables
\\d documents  describe a table
\\du           list roles
\\q            quit`
                }
            },
            {
                type: 'section',
                heading: '3. Create and drop a database',
                text: 'Run these from your normal terminal, not inside psql.',
                code: {
                    lang: 'bash',
                    value: `createdb devvault
dropdb devvault`
                }
            },
            {
                type: 'section',
                heading: '4. Run a SQL file',
                text: 'Execute a schema or migration file against a database.',
                code: { lang: 'bash', value: 'psql -U postgres -d devvault -f schema.sql' }
            },
            {
                type: 'section',
                heading: '5. Back up and restore',
                text: 'pg_dump saves a database to a file, and psql restores it.',
                code: {
                    lang: 'bash',
                    value: `pg_dump -U postgres devvault > backup.sql
psql -U postgres -d devvault -f backup.sql`
                },
                callout: { tone: 'success', text: 'Take a backup before running any migration on production data.' }
            }
        ],
        tags: ['postgresql', 'sql']
    }
];