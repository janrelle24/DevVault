require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const documentRoutes = require('./routes/documents');
const bookmarkRoutes = require('./routes/bookmarks');
const miscRoutes = require('./routes/misc');
const adminRoutes = require('./routes/admin');


/*environment validation*/
const requiredEnv = ['JWT_SECRET', 'CLIENT_ORIGIN'];
for (const name of requiredEnv){
    if(!process.env[name]){
        console.error(` Missing required environment variable: ${name}`);
        process.exit(1);
    }
}if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters long.');
    process.exit(1);
}
/* app*/
const app = express();
/*security headers*/
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
);
/*cors*/
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false
    })
);
/*request body*/
app.use(express.json({ limit: '1mb' }));

/*general API rate limit*/
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please try again later.'
    }
})
//const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', apiLimiter);

/*health check*/
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString() 
    });
});

/*routes*/
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);

/*404*/
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found.' 
    });
});

/* eslint-disable-next-line no-unused-vars*/
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

/*server */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 DevVault API running on http://localhost:${PORT}`);
});
