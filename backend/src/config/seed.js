const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const categories = [
    { name: 'Getting Started', icon: '🚀', sort_order: 1 },
    { name: 'Frontend (React)', icon: '⚛️', sort_order: 2 },
    { name: 'Backend (Node.js)', icon: '🟢', sort_order: 3 },
    { name: 'Database', icon: '🗄️', sort_order: 4 },
    { name: 'Authentication', icon: '🔒', sort_order: 5 },
    { name: 'Deployment', icon: '☁️', sort_order: 6 },
    { name: 'AI Integration', icon: '✨', sort_order: 7 },
    { name: 'Troubleshooting', icon: '🐞', sort_order: 8 }
];

const tags = ['React', 'Vite', 'JavaScript', 'Node.js', 'PostgreSQL', 'Express', 'Auth', 'Deployment', 'API', 'Routes', 'REST'];

const reactInstallContent = [
    {
        type: 'section',
        heading: '1. Check Node.js & npm',
        text: 'Make sure Node.js and npm are installed.',
        code: { lang: 'bash', value: 'node -v\nnpm -v' },
        callout: { tone: 'success', text: 'Both commands should return a version number.' }
    },
    {
        type: 'section',
        heading: '2. Create React Application',
        text: 'Use Vite to create a new React project.',
        code: { lang: 'bash', value: 'npm create vite@latest my-app' }
    },
    {
        type: 'section',
        heading: '3. Select Framework',
        text: 'Select React, then choose JavaScript or TypeScript.',
        code: { lang: 'bash', value: '? Select a framework: > React' }
    },
    {
        type: 'section',
        heading: '4. Enter Project Directory',
        text: 'Move into your newly created project folder.',
        code: { lang: 'bash', value: 'cd my-app' }
    },
    {
        type: 'section',
        heading: '5. Install Dependencies',
        text: 'Install the default React packages.',
        code: { lang: 'bash', value: 'npm install' }    
    },
    {
        type: 'section',
        heading: '6. Install React Router',
        text: 'Add routing for multiple pages.',
        code: { lang: 'bash', value: 'npm install react-router-dom' }
    },
    {
        type: 'section',
        heading: '7. Install Lucide Icons',
        text: 'Add icons to your React interface.',
        code: { lang: 'bash', value: 'npm install lucide-react' }
    },
    {
        type: 'section',
        heading: '8. Install Tailwind CSS',
        text: 'Add Tailwind CSS for utility-based styling.',
        code: { lang: 'bash', value: 'npm install tailwindcss @tailwindcss/vite' }
    },
    {
        type: 'section',
        heading: '9. Start Development Server',
        text: 'Run the local development server with hot reload.',
        code: { lang: 'bash', value: 'npm run dev' }
    },
    {
        type: 'section',
        heading: '10. Verify Installation',
        text: 'Open the printed local URL in your browser. You should see the default Vite + React starter page.',
        callout: { tone: 'success', text: 'If the page loads without errors, your setup is complete.' }
    }
];

const extraDocs = [
    {
        category: 'getting-started',
        title: 'Welcome to DevVault',
        icon: '🚀',
        description: "An overview of DevVault and how to navigate the documentation.",
        content: [
            {   
                type: 'section', 
                heading: '1. What is DevVault?', 
                text: 'DevVault is a personal documentation hub for storing and organizing development guides, installation steps, commands, configurations, and troubleshooting notes. It helps you quickly find the information you need without having to remember every setup process.', 
            }, 
            { 
                type: 'section', 
                heading: '2. What can you store?', 
                text: 'Create documentation for your entire development stack, including frontend, backend, databases, authentication, APIs, deployment, Git, and development tools. Each document can contain explanations, commands, code snippets, and helpful notes.', 
            }, 
            { 
                type: 'section', 
                heading: '3. How to navigate', 
                text: 'Use the sidebar to browse documents by category, or use the search bar to quickly find a specific topic. Press Ctrl+K to open search from anywhere in the application.', 
            }, 
            {
                type: 'section', 
                heading: '4. Organize your documentation', 
                text: 'Use categories and tags to keep your documents organized. Categories group related topics together, while tags make it easier to filter and find specific technologies or concepts.', 
            }, 
            { 
                type: 'section', 
                heading: '5. Create and manage documents', 
                text: 'Create new documentation whenever you learn a new tool, install a dependency, or discover a useful solution. You can update existing documents as your development setup changes.', 
            }, 
            { 
                type: 'section', 
                heading: '6. Why use DevVault?', 
                text: 'DevVault reduces the need to repeatedly search for installation guides or remember commands. Keep your own reliable development notes in one place and build a personal knowledge base you can reuse across projects.', callout: { tone: 'success', text: 'Document it once. Find it whenever you need it.' } 
            }
        ],
        tags: ['javascript']
    },
    {
        category: 'backend-nodejs',
        title: 'Node.js API Setup',
        icon: '🟢',
        description: 'A step-by-step guide for setting up a Node.js backend with commonly used server, database, authentication, validation, and security packages.',
        content: [
        { type: 'section', heading: '1. Check Node.js', text: 'Make sure Node.js is installed.', code: { lang: 'bash', value: 'node -v' }, callout: { tone: 'success', text: 'Use a current LTS version of Node.js.' } },
        { type: 'section', heading: '2. Check npm', text: 'npm is included with Node.js.', code: { lang: 'bash', value: 'npm -v' } },
        { type: 'section', heading: '3. Create Backend Project', text: 'Create a folder and initialize a Node.js project.', code: { lang: 'bash', value: 'mkdir backend\ncd backend\nnpm init -y' } },
        { type: 'section', heading: '4. Install Express', text: 'Use Express to build your backend server and API.', code: { lang: 'bash', value: 'npm install express' } },
        { type: 'section', heading: '5. Install CORS', text: 'Allow your frontend and backend to communicate across different origins.', code: { lang: 'bash', value: 'npm install cors' } },
        { type: 'section', heading: '6. Install dotenv', text: 'Load environment variables from a .env file.', code: { lang: 'bash', value: 'npm install dotenv' } },
        { type: 'section', heading: '7. Install Nodemon', text: 'Automatically restart the server when files change.', code: { lang: 'bash', value: 'npm install --save-dev nodemon' } },
        { type: 'section', heading: '8. Install PostgreSQL', text: 'Use pg to connect your Node.js backend to PostgreSQL.', code: { lang: 'bash', value: 'npm install pg' } },
        { type: 'section', heading: '9. Install bcryptjs', text: 'Hash user passwords before storing them in the database.', code: { lang: 'bash', value: 'npm install bcryptjs' } },
        { type: 'section', heading: '10. Install JWT', text: 'Use JSON Web Tokens for authentication and protected routes.', code: { lang: 'bash', value: 'npm install jsonwebtoken' } },
        { type: 'section', heading: '11. Install Express Validator', text: 'Validate and sanitize incoming request data.', code: { lang: 'bash', value: 'npm install express-validator' } },
        { type: 'section', heading: '12. Install Rate Limit', text: 'Limit repeated requests to help protect API endpoints.', code: { lang: 'bash', value: 'npm install express-rate-limit' } },
        { type: 'section', heading: '13. Install Slugify', text: 'Create URL-friendly slugs from text.', code: { lang: 'bash', value: 'npm install slugify' } },
        { type: 'section', heading: '14. Start Development Server', text: 'Use Nodemon to run the backend during development.', code: { lang: 'bash', value: 'npm run dev' }, callout: { tone: 'success', text: 'Your Node.js backend is ready for development.' } },
        ],
        tags: ['node-js', 'express']
    },
    {
        category: 'backend-nodejs',
        title: 'Express.js Routes Examples',
        icon: '🛣️',
        description: 'Common Express.js route patterns for creating API endpoints, handling requests, using parameters, and organizing backend routes.',
        content: [
            { type: 'section', heading: '1. Basic GET Route', text: 'Create a GET endpoint to return data to the client.', code: { lang: 'javascript', value: `app.get('/api/users', (req, res) => {
                res.json({ message: 'Get users' });
            });`} },
            { type: 'section', heading: '2. POST Route', text: 'Create a POST endpoint to receive data from the client.', code: { lang: 'javascript', 
                value: `app.post('/api/users', (req, res) => {
                    const { name, email } = req.body;
                
                    res.json({
                        message: 'User created',
                        user: { name, email }
                    });
                });`
            } },
            { type: 'section', heading: '3. PUT Route', text: 'Use PUT to replace or update an existing resource.', code: { lang: 'javascript', value: `app.put('/api/users/:id', (req, res) => {
                const { id } = req.params;
                const { name, email } = req.body;
            
                res.json({
                    message: 'User updated',
                    id,
                    name,
                    email
                });
            });`} },
            { type: 'section', heading: '4. PATCH Route',  text: 'Use PATCH to update specific fields of an existing resource.', code: { lang: 'javascript', value: `app.patch('/api/users/:id', (req, res) => {
                const { id } = req.params;
            
                res.json({
                    message: 'User partially updated',
                    id
                });
            });`} },
            { type: 'section', heading: '5. DELETE Route', text: 'Create a DELETE endpoint to remove a resource.', code: { lang: 'javascript', value: `app.delete('/api/users/:id', (req, res) => {
                const { id } = req.params;
            
                res.json({
                    message: 'User deleted',
                    id
                });
            });`} },
            { type: 'section', heading: '6. Route Parameters', text: 'Use route parameters to access values directly from the URL.', code: { lang: 'javascript', value: `app.get('/api/users/:id', (req, res) => {
                const { id } = req.params;
            
                res.json({ userId: id });
            });`}, callout: { tone: 'success', text: 'Example: GET /api/users/123 returns id 123.' } },
            { type: 'section', heading: '7. Query Parameters', text: 'Use query parameters for filtering, searching, or pagination.', code: { lang: 'javascript', value: `app.get('/api/users', (req, res) => {
                const { search, page } = req.query;
            
                res.json({ search, page });
            });`}, callout: {  tone: 'success', text: 'Example: GET /api/users?search=jan&page=1'} },
            { type: 'section', type: 'section', text: 'Move related routes into a separate router file to keep the server organized.', code: { lang: 'javascript', value: `const express = require('express');
                const router = express.Router();
                
                router.get('/', (req, res) => {
                    res.json({ message: 'Get users' });
                });
                
                router.post('/', (req, res) => {
                    res.json({ message: 'Create user' });
                });
                
                module.exports = router;`} },
            { type: 'section', heading: '9. Register the Router', text: 'Import the router into your server and add a base API path.', code: { lang: 'javascript', value: `const userRoutes = require('./routes/userRoutes');

                app.use('/api/users', userRoutes);`}, callout: { tone: 'success', text: 'Routes are now available under /api/users.'} },
            { type: 'section', heading: '10. Common API Structure', text: 'A typical REST API uses HTTP methods for different operations.', code: { lang: 'text', value: `GET     /api/users       → Get users
                GET     /api/users/:id   → Get one user
                POST    /api/users       → Create user
                PUT     /api/users/:id   → Update user
                PATCH   /api/users/:id   → Partially update user
                DELETE  /api/users/:id   → Delete user`}}

        ],
        tags: ['node-js', 'express', 'api', 'routes', 'rest']
    },
    {
        category: 'database',
        title: 'PostgreSQL Setup',
        icon: '🗄️',
        description: 'Install PostgreSQL locally and create your first database.',
        content: [
        { type: 'section', heading: '1. Install PostgreSQL', text: 'Use your OS package manager.', code: { lang: 'bash', value: 'brew install postgresql@16' } },
        { type: 'section', heading: '2. Create a database', text: 'Create the database used by the app.', code: { lang: 'bash', value: 'createdb devvault' } },
        { type: 'section', heading: '3. Apply the schema', text: 'Run the schema against your new database.', code: { lang: 'bash', value: 'npm run db:migrate' } }
        ],
        tags: ['postgresql']
    },
    {
        category: 'authentication',
        title: 'Admin Authentication & Protected Routes',
        icon: '🔒',
        description: 'How DevVault handles JWT auth, roles, and the admin dashboard.',
        content: [
        {
            type: 'section',
            heading: '1. How roles work',
            text: "Every user has a role of 'user' or 'admin', stored on the users table and embedded in the JWT payload."
        },
        {
            type: 'section',
            heading: '2. Protecting API routes',
            text: 'requireAuth checks the Bearer token; requireAdmin (used after it) rejects any non-admin caller with a 403.'
        },
        {
            type: 'section',
            heading: '3. Protecting frontend routes',
            text: 'The React app wraps /admin routes in a <ProtectedRoute adminOnly> component that redirects non-admins to the login page.'
        },
        {
            type: 'section',
            heading: '4. Creating the first admin',
            text: 'Run the seed script — it upserts an admin account from your ADMIN_EMAIL / ADMIN_PASSWORD environment variables.',
            code: { lang: 'bash', value: 'npm run db:seed' }
        }
        ],
        tags: ['auth']
    },
    {
        category: 'deployment',
        title: 'Deploying DevVault',
        icon: '☁️',
        description: 'Push to GitHub, then deploy the frontend, backend, and database.',
        content: [
        {
            type: 'section',
            heading: '1. Push to GitHub',
            text: 'Initialize a repo at the project root and push both frontend/ and backend/.',
            code: { lang: 'bash', value: 'git init && git add . && git commit -m "Initial commit" && git push' }
        },
        {
            type: 'section',
            heading: '2. Provision a PostgreSQL database',
            text: 'Use a managed instance (Render, Railway, Supabase, Neon, or RDS) and copy its connection string into DATABASE_URL.'
        },
        {
            type: 'section',
            heading: '3. Deploy the backend',
            text: 'Deploy backend/ to Render, Railway, or Fly.io. Set DATABASE_URL, JWT_SECRET, and CLIENT_ORIGIN as environment variables, then run the migration and seed scripts once against production.'
        },
        {
            type: 'section',
            heading: '4. Deploy the frontend',
            text: 'Deploy frontend/ to Vercel or Netlify. Point it at your deployed backend URL.'
        }
        ],
        tags: ['deployment']
    }
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Categories
        const categoryIds = {};
        for (const c of categories) {
        const slug = slugify(c.name, { lower: true, strict: true });
        const res = await client.query(
            `INSERT INTO categories (name, slug, icon, sort_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, slug`,
            [c.name, slug, c.icon, c.sort_order]
        );
        categoryIds[slug] = res.rows[0].id;
        }

        // Tags
        const tagIds = {};
        for (const t of tags) {
        const slug = slugify(t, { lower: true, strict: true });
        const res = await client.query(
            `INSERT INTO tags (name, slug) VALUES ($1, $2)
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, slug`,
            [t, slug]
        );
        tagIds[slug] = res.rows[0].id;
        }

        // Admin user (from env, or sensible defaults)
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@devvault.dev').toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || 'change_this_password';
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
        const adminRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, 'admin')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
        RETURNING id`,
        [process.env.ADMIN_NAME || 'Admin User', adminEmail, adminPasswordHash]
        );
        const adminId = adminRes.rows[0].id;

        // Demo regular user
        const demoPasswordHash = await bcrypt.hash('password123', 10);
        await client.query(
        `INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, 'user')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id`,
        ['Demo User', 'demo@devvault.dev', demoPasswordHash]
        );

        // React Installation doc (matches the mockup)
        /**ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = now() */
        const docRes = await client.query(
        `INSERT INTO documents (category_id, title, slug, icon, description, content, author_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = now()
        RETURNING id`,
        [
            categoryIds['frontend-react'],
            'React Installation',
            'react-installation',
            '⚛️',
            'Step-by-step guide to install and set up React with Vite for a modern and fast development experience.',
            JSON.stringify(reactInstallContent),
            adminId
        ]
        );
        const docId = docRes.rows[0].id;

        for (const slug of ['react', 'vite', 'javascript']) {
        if (tagIds[slug]) {
            await client.query(
            `INSERT INTO document_tags (document_id, tag_id) VALUES ($1, $2)
            ON CONFLICT DO NOTHING`,
            [docId, tagIds[slug]]
            );
        }
        }

        // Additional sample docs
        /**ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = now() */
        for (const d of extraDocs) {
        const slug = slugify(d.title, { lower: true, strict: true });
        const res = await client.query(
            `INSERT INTO documents (category_id, title, slug, icon, description, content, author_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, content = EXCLUDED.content, updated_at = now()
            RETURNING id`,
            [categoryIds[d.category] || null, d.title, slug, d.icon, d.description, JSON.stringify(d.content), adminId]
        );
        const id = res.rows[0].id;
        
        for (const t of d.tags) {
            if (tagIds[t]) {
            await client.query(
                `INSERT INTO document_tags (document_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [id, tagIds[t]]
            );
            }
        }
    
        }

        await client.query('COMMIT');
        console.log('✅ Seed complete.');
        console.log(`   Admin login: ${adminEmail} / ${adminPassword}`);
        console.log('   Demo login:  demo@devvault.dev / password123');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
