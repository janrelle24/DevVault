const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error on idle client', err);
    process.exit(1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
