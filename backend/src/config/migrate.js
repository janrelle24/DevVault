const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'schema.sql');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function listMigrationPaths() {
    if (!fs.existsSync(MIGRATIONS_DIR)) return [];

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .map((file) => path.join(MIGRATIONS_DIR, file));
}

async function applySqlFile(filePath) {
    console.log(`Applying ${path.basename(filePath)} ...`);
    await pool.query(fs.readFileSync(filePath, 'utf8'));
}

async function migrate() {
    for (const filePath of [SCHEMA_PATH, ...listMigrationPaths()]) {
        await applySqlFile(filePath);
    }
    console.log('✅ Schema applied successfully.');
    await pool.end();
}
/*
async function migrate() {
    const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema.sql ...');
    await pool.query(sql);
    console.log('✅ Schema applied successfully.');
    await pool.end();
}*/

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
