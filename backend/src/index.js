require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'DevVault API is running!' });
});

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

db.query('SELECT NOW()')
    .then(() => {
        console.log('✅ PostgreSQL connected');
    })
    .catch((err) => {
        console.error('❌ PostgreSQL connection failed:', err.message);
    });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 DevVault API running on http://localhost:${PORT}`);
});