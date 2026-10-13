// backend/src/config/authDocs.js
// Authentication learning notes. Category: 'authentication'

module.exports = [
    {
        category: 'authentication',
        title: 'Password Hashing with bcryptjs',
        icon: 'jwt',
        description: 'Never store plain-text passwords. Hash them before saving and compare on login.',
        content: [
            {
                type: 'section',
                heading: '1. Why hash passwords?',
                text: 'If your database leaks, hashed passwords cannot be read back. A hash is one-way: you can verify a password against it, but you cannot reverse it.',
                callout: { tone: 'success', text: 'Never store, log, or return plain-text passwords.' }
            },
            {
                type: 'section',
                heading: '2. Install bcryptjs',
                text: 'bcryptjs is a pure JavaScript implementation, so it installs without native build tools.',
                code: { lang: 'bash', value: 'npm install bcryptjs' }
            },
            {
                type: 'section',
                heading: '3. Hash a password',
                text: 'The second argument is the salt rounds. 10 is a common balance between security and speed.',
                code: {
                    lang: 'javascript',
                    value: `const bcrypt = require('bcryptjs');

const passwordHash = await bcrypt.hash(password, 10);
// Save passwordHash in the password_hash column`
                }
            },
            {
                type: 'section',
                heading: '4. Compare on login',
                text: 'Use compare() to check the submitted password against the stored hash.',
                code: {
                    lang: 'javascript',
                    value: `const isMatch = await bcrypt.compare(password, user.password_hash);

if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
}`
                }
            },
            {
                type: 'section',
                heading: '5. Keep error messages generic',
                text: 'Use the same message for "user not found" and "wrong password". This stops attackers from discovering which emails are registered.'
            }
        ],
        tags: ['auth', 'security', 'nodejs']
    },
    {
        category: 'authentication',
        title: 'JWT Authentication Flow',
        icon: 'jwt',
        description: 'Understand how JSON Web Tokens work and how to sign and verify them in Node.js.',
        content: [
            {
                type: 'section',
                heading: '1. How the flow works',
                text: 'The user logs in with email and password. The server verifies them and returns a signed token. The client sends that token in the Authorization header on every protected request.',
                code: {
                    lang: 'text',
                    value: `1. POST /api/auth/login        → email + password
2. Server verifies, signs JWT  → returns token
3. Client stores the token
4. GET /api/admin/...          → Authorization: Bearer <token>
5. Server verifies the token    → allows or rejects`
                }
            },
            {
                type: 'section',
                heading: '2. Install jsonwebtoken',
                text: 'Install the package that signs and verifies tokens.',
                code: { lang: 'bash', value: 'npm install jsonwebtoken' }
            },
            {
                type: 'section',
                heading: '3. Generate a strong secret',
                text: 'Create a long random string and save it as JWT_SECRET in your .env file. Never commit it.',
                code: {
                    lang: 'bash',
                    value: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
                }
            },
            {
                type: 'section',
                heading: '4. Sign a token',
                text: 'Put only the data you need in the payload (id and role). Never include the password or hash.',
                code: {
                    lang: 'javascript',
                    value: `const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);`
                }
            },
            {
                type: 'section',
                heading: '5. Verify a token',
                text: 'verify() returns the payload if the token is valid and throws if it is invalid or expired.',
                code: {
                    lang: 'javascript',
                    value: `try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload.id, payload.role);
} catch (err) {
    console.log('Invalid or expired token');
}`
                },
                callout: { tone: 'success', text: 'A JWT is signed, not encrypted. Anyone can read the payload, so never store secrets in it.' }
            }
        ],
        tags: ['auth', 'jwt', 'nodejs']
    },
    {
        category: 'authentication',
        title: 'Register & Login Routes',
        icon: 'jwt',
        description: 'Build register and login endpoints with validation, hashing, and JWT.',
        content: [
            {
                type: 'section',
                heading: '1. Set up the router',
                text: 'Import everything the auth routes need.',
                code: {
                    lang: 'javascript',
                    value: `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

const router = express.Router();`
                }
            },
            {
                type: 'section',
                heading: '2. Validation rules',
                text: 'Validate and sanitize input before it reaches your database logic.',
                code: {
                    lang: 'javascript',
                    value: `const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().toLowerCase().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];`
                }
            },
            {
                type: 'section',
                heading: '3. Register route',
                text: 'Check validation, make sure the email is unused, hash the password, then insert the user.',
                code: {
                    lang: 'javascript',
                    value: `router.post('/register', registerRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
        [name, email, passwordHash]
    );

    res.status(201).json({ user: result.rows[0] });
});`
                }
            },
            {
                type: 'section',
                heading: '4. Login route',
                text: 'Find the user, compare the password, and return a signed token.',
                code: {
                    lang: 'javascript',
                    value: `router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase()]);
    const user = result.rows[0];

    const isMatch = user && await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

module.exports = router;`
                },
                callout: { tone: 'success', text: 'Express 5 forwards errors from async handlers automatically, so no try/catch wrapper is required for basic cases.' }
            },
            {
                type: 'section',
                heading: '5. Mount the router',
                text: 'Register the routes in your main server file.',
                code: {
                    lang: 'javascript',
                    value: `const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);`
                }
            }
        ],
        tags: ['auth', 'api', 'nodejs', 'express']
    },
    {
        category: 'authentication',
        title: 'Auth Middleware: requireAuth & requireAdmin',
        icon: 'jwt',
        description: 'Protect API routes by verifying the JWT and checking the user role.',
        content: [
            {
                type: 'section',
                heading: '1. What is middleware?',
                text: 'Middleware is a function that runs before your route handler. It can inspect the request, reject it, or call next() to continue.'
            },
            {
                type: 'section',
                heading: '2. requireAuth',
                text: 'Read the Bearer token, verify it, and attach the payload to req.user.',
                code: {
                    lang: 'javascript',
                    value: `const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}`
                }
            },
            {
                type: 'section',
                heading: '3. requireAdmin',
                text: 'Use this after requireAuth. It rejects any user whose role is not admin.',
                code: {
                    lang: 'javascript',
                    value: `function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin };`
                }
            },
            {
                type: 'section',
                heading: '4. Apply to routes',
                text: 'List the middleware before the handler. Order matters.',
                code: {
                    lang: 'javascript',
                    value: `const { requireAuth, requireAdmin } = require('../middleware/auth');

// Any logged-in user
router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

// Admins only
router.delete('/documents/:id', requireAuth, requireAdmin, (req, res) => {
    res.json({ message: 'Deleted' });
});`
                }
            },
            {
                type: 'section',
                heading: '5. 401 vs 403',
                text: '401 means "not logged in or bad token". 403 means "logged in, but not allowed".',
                callout: { tone: 'success', text: 'The frontend ProtectedRoute is only for user experience. The real protection is always on the backend.' }
            }
        ],
        tags: ['auth', 'jwt', 'express']
    },
    {
        category: 'authentication',
        title: 'Frontend Login with React',
        icon: 'jwt',
        description: 'Send login requests, store the token, attach it to requests, and log out.',
        content: [
            {
                type: 'section',
                heading: '1. Login request',
                text: 'Send the credentials to the backend and save the returned token.',
                code: {
                    lang: 'jsx',
                    value: `async function login(email, password) {
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    return data.user;
}`
                }
            },
            {
                type: 'section',
                heading: '2. Attach the token to requests',
                text: 'Create a small helper so every protected request includes the Authorization header.',
                code: {
                    lang: 'jsx',
                    value: `export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('token');

    return fetch(import.meta.env.VITE_API_URL + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            ...options.headers
        }
    });
}`
                }
            },
            {
                type: 'section',
                heading: '3. Log out',
                text: 'Logging out simply removes the token on the client.',
                code: {
                    lang: 'jsx',
                    value: `function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}`
                }
            },
            {
                type: 'section',
                heading: '4. Restore the session on page load',
                text: 'Call a protected endpoint such as /api/auth/me when the app starts to confirm the saved token is still valid.',
                code: {
                    lang: 'jsx',
                    value: `useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    apiFetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'));
}, []);`
                },
                callout: { tone: 'success', text: 'localStorage is simple but readable by any script on the page, so protect against XSS. HttpOnly cookies are the more secure alternative.' }
            }
        ],
        tags: ['auth', 'react', 'jwt']
    },
    {
        category: 'authentication',
        title: 'Securing Your Express API',
        icon: 'jwt',
        description: 'Add helmet, CORS, and rate limiting to protect your backend.',
        content: [
            {
                type: 'section',
                heading: '1. Install the packages',
                text: 'These are the security basics for most Express APIs.',
                code: { lang: 'bash', value: 'npm install helmet cors express-rate-limit' }
            },
            {
                type: 'section',
                heading: '2. Helmet',
                text: 'Helmet sets secure HTTP headers with one line.',
                code: {
                    lang: 'javascript',
                    value: `const helmet = require('helmet');

app.use(helmet());`
                }
            },
            {
                type: 'section',
                heading: '3. CORS',
                text: 'Allow only your own frontend to call the API. Do not leave it open to every origin in production.',
                code: {
                    lang: 'javascript',
                    value: `const cors = require('cors');

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));`
                }
            },
            {
                type: 'section',
                heading: '4. Rate limit login attempts',
                text: 'Limit repeated requests to slow down brute-force attacks.',
                code: {
                    lang: 'javascript',
                    value: `const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                // 10 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' }
});

app.use('/api/auth/login', authLimiter);`
                }
            },
            {
                type: 'section',
                heading: '5. Limit body size',
                text: 'Reject unusually large JSON payloads.',
                code: { lang: 'javascript', value: "app.use(express.json({ limit: '1mb' }));" }
            },
            {
                type: 'section',
                heading: '6. Trust the proxy in production',
                text: 'Hosts like Render sit behind a proxy. Without this setting, rate limiting sees every request as coming from the same IP.',
                code: { lang: 'javascript', value: "app.set('trust proxy', 1);" },
                callout: { tone: 'success', text: 'Never trust user input. Validate on the server and always use parameterized SQL queries.' }
            }
        ],
        tags: ['auth', 'security', 'express']
    },
    {
        category: 'authentication',
        title: 'Sending Emails with Nodemailer',
        icon: 'jwt',
        description: 'Send verification and password reset emails from your Node.js backend.',
        content: [
            {
                type: 'section',
                heading: '1. Install Nodemailer',
                text: 'Add the email package to your backend.',
                code: { lang: 'bash', value: 'npm install nodemailer' }
            },
            {
                type: 'section',
                heading: '2. Add SMTP settings to .env',
                text: 'Use your email provider SMTP details. For Gmail, create an App Password instead of using your real password.',
                code: {
                    lang: 'text',
                    value: `SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="DevVault <your-email@gmail.com>"`
                }
            },
            {
                type: 'section',
                heading: '3. Create the transporter',
                text: 'The transporter holds the connection settings. Create it once and reuse it.',
                code: {
                    lang: 'javascript',
                    value: `const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});`
                }
            },
            {
                type: 'section',
                heading: '4. Send an email',
                text: 'Call sendMail with the recipient, subject, and HTML body.',
                code: {
                    lang: 'javascript',
                    value: `async function sendVerificationEmail(to, link) {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Verify your DevVault account',
        html: '<p>Click the link below to verify your email:</p><a href="' + link + '">Verify email</a>'
    });
}`
                }
            },
            {
                type: 'section',
                heading: '5. Email verification flow',
                text: 'A typical flow generates a random token, stores it with an expiry, emails a link, and marks the user verified when the link is opened.',
                code: {
                    lang: 'javascript',
                    value: `const crypto = require('crypto');

const verifyToken = crypto.randomBytes(32).toString('hex');
// Save verifyToken + expiry for the user, then email:
// CLIENT_ORIGIN/verify-email?token=<verifyToken>`
                },
                callout: { tone: 'success', text: 'Never commit SMTP credentials. Keep them in .env and in your host environment variables.' }
            }
        ],
        tags: ['auth', 'nodejs', 'security']
    }
];