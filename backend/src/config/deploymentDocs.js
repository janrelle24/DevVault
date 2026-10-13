// backend/src/config/deploymentDocs.js
// Deployment learning notes. Categories: 'deployment' and 'troubleshooting'

module.exports = [
    {
        category: 'deployment',
        title: 'Environment Variables & .env Files',
        icon: 'vercel',
        description: 'Keep secrets and configuration out of your code, locally and in production.',
        content: [
            {
                type: 'section',
                heading: '1. What are environment variables?',
                text: 'They are settings stored outside your code, such as database URLs and secret keys. They change between development and production without touching the source.'
            },
            {
                type: 'section',
                heading: '2. Create a backend .env file',
                text: 'Place it in the backend folder, next to package.json.',
                code: {
                    lang: 'text',
                    value: `PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/devvault
JWT_SECRET=replace_with_a_long_random_string
CLIENT_ORIGIN=http://localhost:5173
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=use_a_strong_password`
                }
            },
            {
                type: 'section',
                heading: '3. Load and read them',
                text: 'Call dotenv at the very top of your entry file, then read values from process.env.',
                code: {
                    lang: 'javascript',
                    value: `require('dotenv').config();

const PORT = process.env.PORT || 5000;
console.log(process.env.CLIENT_ORIGIN);`
                }
            },
            {
                type: 'section',
                heading: '4. Never commit .env',
                text: 'Add it to .gitignore, and commit a .env.example file with empty values so other developers know which variables are needed.',
                code: {
                    lang: 'text',
                    value: `# .gitignore
node_modules
.env
dist`
                },
                callout: { tone: 'success', text: 'If a secret was ever pushed to GitHub, treat it as leaked and generate a new one.' }
            },
            {
                type: 'section',
                heading: '5. Frontend variables in Vite',
                text: 'Vite only exposes variables that start with VITE_. They are bundled into the public JavaScript, so never put secrets in them.',
                code: {
                    lang: 'text',
                    value: `# frontend/.env
VITE_API_URL=http://localhost:5000`
                }
            },
            {
                type: 'section',
                heading: '6. Read them in React',
                text: 'Use import.meta.env, not process.env.',
                code: { lang: 'jsx', value: 'const API_URL = import.meta.env.VITE_API_URL;' }
            }
        ],
        tags: ['deployment', 'environment', 'security']
    },
    {
        category: 'deployment',
        title: 'Git & GitHub Basics',
        icon: 'vercel',
        description: 'Track your code with Git and push it to GitHub so it can be deployed.',
        content: [
            {
                type: 'section',
                heading: '1. Check Git is installed',
                text: 'Confirm Git is available.',
                code: { lang: 'bash', value: 'git --version' }
            },
            {
                type: 'section',
                heading: '2. Configure your identity',
                text: 'Do this once per computer.',
                code: {
                    lang: 'bash',
                    value: `git config --global user.name "Your Name"
git config --global user.email "you@example.com"`
                }
            },
            {
                type: 'section',
                heading: '3. Initialize and make the first commit',
                text: 'Run this at the project root so both frontend and backend are included. Create the .gitignore first.',
                code: {
                    lang: 'bash',
                    value: `git init
git add .
git commit -m "Initial commit"`
                }
            },
            {
                type: 'section',
                heading: '4. Connect to GitHub and push',
                text: 'Create an empty repository on GitHub, then connect it and push.',
                code: {
                    lang: 'bash',
                    value: `git branch -M main
git remote add origin https://github.com/your-username/devvault.git
git push -u origin main`
                }
            },
            {
                type: 'section',
                heading: '5. Everyday workflow',
                text: 'After the first push, this is the loop you will repeat.',
                code: {
                    lang: 'bash',
                    value: `git status
git add .
git commit -m "Add Tailwind docs"
git push`
                }
            },
            {
                type: 'section',
                heading: '6. Use branches for new features',
                text: 'Work on a branch, then merge it back when it is ready.',
                code: {
                    lang: 'bash',
                    value: `git checkout -b feature/search
# ...make changes and commit...
git checkout main
git merge feature/search`
                },
                callout: { tone: 'success', text: 'Write short, specific commit messages. Your future self will thank you.' }
            }
        ],
        tags: ['git', 'deployment']
    },
    {
        category: 'deployment',
        title: 'Deploy the Node.js Backend to Render',
        icon: 'vercel',
        description: 'Host your Express API on Render with environment variables.',
        content: [
            {
                type: 'section',
                heading: '1. Prepare the server',
                text: 'Your server must listen on the port provided by the host, and your package.json needs a start script.',
                code: {
                    lang: 'javascript',
                    value: `const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});`
                }
            },
            {
                type: 'section',
                heading: '2. Confirm the start script',
                text: 'Render runs npm start in production.',
                code: {
                    lang: 'json',
                    value: `"scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
}`
                }
            },
            {
                type: 'section',
                heading: '3. Create a Web Service',
                text: 'On Render choose New, then Web Service, and connect your GitHub repository.'
            },
            {
                type: 'section',
                heading: '4. Configure the service',
                text: 'Because the backend lives in a subfolder, set the root directory.',
                code: {
                    lang: 'text',
                    value: `Root Directory:  backend
Build Command:   npm install
Start Command:   npm start`
                }
            },
            {
                type: 'section',
                heading: '5. Add environment variables',
                text: 'In the Environment tab add every variable from your .env file, using production values.',
                code: {
                    lang: 'text',
                    value: `NODE_ENV=production
DATABASE_URL=<your managed database URL>
JWT_SECRET=<new long random secret>
CLIENT_ORIGIN=https://your-app.vercel.app`
                }
            },
            {
                type: 'section',
                heading: '6. Run migrations and seed once',
                text: 'Point your local terminal at the production database and run the scripts. In PowerShell, set the variable first.',
                code: {
                    lang: 'bash',
                    value: `# PowerShell
$env:DATABASE_URL="your-production-database-url"
npm run db:migrate
npm run db:seed`
                }
            },
            {
                type: 'section',
                heading: '7. Test the API',
                text: 'Open your service URL plus an API route in the browser.',
                code: { lang: 'text', value: 'https://your-backend.onrender.com/api/categories' },
                callout: { tone: 'success', text: 'Free Render services sleep when idle, so the first request after a while can take about a minute.' }
            }
        ],
        tags: ['deployment', 'nodejs', 'express']
    },
    {
        category: 'deployment',
        title: 'Deploy the React Frontend to Vercel',
        icon: 'vercel',
        description: 'Publish your Vite + React app on Vercel and connect it to your backend.',
        content: [
            {
                type: 'section',
                heading: '1. Push your code to GitHub',
                text: 'Vercel deploys directly from a GitHub repository.'
            },
            {
                type: 'section',
                heading: '2. Import the project',
                text: 'On Vercel choose Add New, then Project, and pick your repository.'
            },
            {
                type: 'section',
                heading: '3. Configure the build',
                text: 'Set the root directory to the frontend folder. Vercel detects Vite automatically.',
                code: {
                    lang: 'text',
                    value: `Framework Preset:  Vite
Root Directory:    frontend
Build Command:     npm run build
Output Directory:  dist`
                }
            },
            {
                type: 'section',
                heading: '4. Add the API URL',
                text: 'Under Environment Variables add the address of your deployed backend, without a trailing slash.',
                code: { lang: 'text', value: 'VITE_API_URL=https://your-backend.onrender.com' }
            },
            {
                type: 'section',
                heading: '5. Fix page refresh 404 errors',
                text: 'A single-page app handles routes in the browser. Add a vercel.json inside the frontend folder so every path serves index.html.',
                code: {
                    lang: 'json',
                    value: `{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}`
                }
            },
            {
                type: 'section',
                heading: '6. Deploy and update the backend CORS',
                text: 'After deploying, copy your Vercel URL and set it as CLIENT_ORIGIN on the backend, then redeploy the backend.',
                callout: { tone: 'success', text: 'Vite variables are baked in at build time. After changing VITE_API_URL you must redeploy the frontend.' }
            }
        ],
        tags: ['deployment', 'react', 'vite']
    },
    {
        category: 'deployment',
        title: 'Managed PostgreSQL with Neon',
        icon: 'vercel',
        description: 'Create a free hosted PostgreSQL database and connect your backend to it.',
        content: [
            {
                type: 'section',
                heading: '1. Create a project',
                text: 'Sign up at neon.tech, then create a new project and choose the region closest to your backend.'
            },
            {
                type: 'section',
                heading: '2. Copy the connection string',
                text: 'In the dashboard, copy the connection string. It ends with sslmode=require.',
                code: {
                    lang: 'text',
                    value: 'postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require'
                }
            },
            {
                type: 'section',
                heading: '3. Set DATABASE_URL',
                text: 'Add the string as DATABASE_URL in your backend host environment variables. Use a separate local .env value for development.'
            },
            {
                type: 'section',
                heading: '4. Enable SSL in the Pool',
                text: 'Hosted databases require encrypted connections.',
                code: {
                    lang: 'javascript',
                    value: `const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});`
                }
            },
            {
                type: 'section',
                heading: '5. Create the tables',
                text: 'Run your migration and seed scripts against the new database.',
                code: {
                    lang: 'bash',
                    value: `npm run db:migrate
npm run db:seed`
                },
                callout: { tone: 'success', text: 'Supabase, Railway, and Render also offer managed PostgreSQL. The steps are nearly identical.' }
            }
        ],
        tags: ['deployment', 'postgresql']
    },
    {
        category: 'deployment',
        title: 'CORS for Production',
        icon: 'vercel',
        description: 'Allow your deployed frontend to call your deployed backend safely.',
        content: [
            {
                type: 'section',
                heading: '1. What is CORS?',
                text: 'Browsers block a page from calling an API on a different origin unless that API explicitly allows it. The frontend and backend have different URLs in production, so you must configure this.'
            },
            {
                type: 'section',
                heading: '2. Allow one origin',
                text: 'Set the exact frontend URL. It must match exactly, with no trailing slash.',
                code: {
                    lang: 'javascript',
                    value: `const cors = require('cors');

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));`
                }
            },
            {
                type: 'section',
                heading: '3. Allow several origins',
                text: 'Store a comma-separated list and check each request against it. This covers both local development and production.',
                code: {
                    lang: 'javascript',
                    value: `const allowed = (process.env.CLIENT_ORIGIN || '').split(',');

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowed.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    }
}));`
                }
            },
            {
                type: 'section',
                heading: '4. Example value',
                text: 'Use it in your host environment variables.',
                code: {
                    lang: 'text',
                    value: 'CLIENT_ORIGIN=http://localhost:5173,https://your-app.vercel.app'
                },
                callout: { tone: 'success', text: 'Register cors() before your routes, otherwise the headers will not be added.' }
            }
        ],
        tags: ['deployment', 'api', 'security']
    },
    {
        category: 'deployment',
        title: 'Production Checklist',
        icon: 'vercel',
        description: 'Things to verify before and after you go live.',
        content: [
            {
                type: 'section',
                heading: '1. Secrets',
                text: 'Use a new, long, random JWT_SECRET and a strong admin password in production. Do not reuse your development values.'
            },
            {
                type: 'section',
                heading: '2. Environment',
                text: 'Set NODE_ENV=production on the backend. Confirm every required variable is set on the host and that .env is in .gitignore.'
            },
            {
                type: 'section',
                heading: '3. Security middleware',
                text: 'Confirm helmet, CORS locked to your frontend, and rate limiting on the login route are active.'
            },
            {
                type: 'section',
                heading: '4. Database',
                text: 'Run migrations, seed the admin account, and confirm SSL works. Take a backup before every future migration.'
            },
            {
                type: 'section',
                heading: '5. Test the whole flow',
                text: 'After deploying, test in this order.',
                code: {
                    lang: 'text',
                    value: `1. Backend URL responds
2. Frontend loads and lists documents
3. Login works as admin
4. Admin dashboard is blocked for normal users
5. Refreshing a nested page does not 404`
                }
            },
            {
                type: 'section',
                heading: '6. HTTPS everywhere',
                text: 'Render and Vercel provide HTTPS automatically. Make sure VITE_API_URL starts with https:// so the browser does not block mixed content.',
                callout: { tone: 'success', text: 'Change the demo account password or remove the demo user before sharing the site publicly.' }
            }
        ],
        tags: ['deployment', 'security']
    },
    {
        category: 'troubleshooting',
        title: 'Fixing Common Deployment Errors',
        icon: 'bug',
        description: 'Quick fixes for the errors you are most likely to hit when deploying.',
        content: [
            {
                type: 'section',
                heading: '1. CORS error in the browser',
                text: 'The console says the request was blocked by the CORS policy. Set CLIENT_ORIGIN on the backend to your exact frontend URL (no trailing slash) and redeploy the backend.'
            },
            {
                type: 'section',
                heading: '2. 404 when refreshing a page',
                text: 'The page works from a link but breaks on refresh. Your host does not know about client-side routes. On Vercel add a vercel.json rewrite to index.html. On Netlify add a _redirects file.',
                code: { lang: 'text', value: '/*    /index.html   200' }
            },
            {
                type: 'section',
                heading: '3. Frontend still calls localhost',
                text: 'VITE_API_URL is missing or was changed after the build. Set it in the host settings and trigger a new frontend deployment.'
            },
            {
                type: 'section',
                heading: '4. Database SSL error',
                text: 'Errors mentioning SSL or "no pg_hba.conf entry" mean the host requires encryption. Enable the ssl option in your Pool and use a connection string ending with sslmode=require.'
            },
            {
                type: 'section',
                heading: '5. Application failed to start',
                text: 'Check the logs for a missing environment variable or a wrong start command. Confirm the root directory is backend and the start command is npm start.'
            },
            {
                type: 'section',
                heading: '6. 401 Unauthorized on every request',
                text: 'The JWT_SECRET on the server differs from the one used to sign the token, or the Authorization header is missing. Log out, log in again, and confirm the header format is Bearer followed by the token.'
            },
            {
                type: 'section',
                heading: '7. Cannot find module',
                text: 'Usually a package missing from dependencies, or a file name with different letter case. Linux hosts are case-sensitive, so ./userRoutes and ./UserRoutes are different files.',
                callout: { tone: 'success', text: 'Always read the deployment logs first. The real error is almost always there.' }
            }
        ],
        tags: ['troubleshooting', 'deployment']
    }
];