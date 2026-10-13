// backend/src/config/databaseInstallDocs.js
// Installation guides for PostgreSQL (local) and Supabase (hosted).
// Categories: 'database' and 'troubleshooting'
//
// NOTE: backslashes inside template literals must be doubled (\\),
// otherwise Windows paths get mangled.

module.exports = [
    {
        category: 'database',
        title: 'Install PostgreSQL Locally on Windows',
        icon: 'postgresql',
        description: 'Install PostgreSQL on Windows, add it to your PATH, and create your first database.',
        content: [
            {
                type: 'section',
                heading: '1. Download the installer',
                text: 'Go to postgresql.org/download/windows and download the installer for the current stable version (the EDB installer).'
            },
            {
                type: 'section',
                heading: '2. Run the installer',
                text: 'Keep the default components selected: PostgreSQL Server, pgAdmin 4, and Command Line Tools. Stack Builder is optional and can be skipped.'
            },
            {
                type: 'section',
                heading: '3. Set the superuser password',
                text: 'The installer asks for a password for the default postgres user. Choose one you will remember, because you will need it for DATABASE_URL.',
                callout: { tone: 'success', text: 'Save this password in a safe place. It is the most common thing people forget.' }
            },
            {
                type: 'section',
                heading: '4. Keep the default port',
                text: 'Leave the port as 5432 unless something else already uses it. Finish the installation with the default locale.'
            },
            {
                type: 'section',
                heading: '5. Add PostgreSQL to your PATH',
                text: 'So that psql and createdb work in any terminal, add the bin folder to your PATH. Open "Edit the system environment variables", click Environment Variables, select Path, click New, and add the folder below (change 16 to your version).',
                code: { lang: 'text', value: 'C:\\Program Files\\PostgreSQL\\16\\bin' }
            },
            {
                type: 'section',
                heading: '6. Verify the installation',
                text: 'Open a new terminal (an old one will not see the PATH change) and check the version.',
                code: { lang: 'bash', value: 'psql --version' },
                callout: { tone: 'success', text: 'It should print something like: psql (PostgreSQL) 16.x' }
            },
            {
                type: 'section',
                heading: '7. Create the database',
                text: 'Create a database for DevVault. Enter your postgres password when asked.',
                code: { lang: 'bash', value: 'createdb -U postgres devvault' }
            },
            {
                type: 'section',
                heading: '8. Confirm it exists',
                text: 'Connect to the new database and list its tables. It will be empty until you run the migration.',
                code: {
                    lang: 'bash',
                    value: `psql -U postgres -d devvault
\\dt
\\q`
                }
            },
            {
                type: 'section',
                heading: '9. Check the service is running',
                text: 'PostgreSQL runs as a Windows service that starts automatically. If you cannot connect, open Services (services.msc), find the postgresql service, and start it.'
            },
            {
                type: 'section',
                heading: '10. Alternative: install with winget',
                text: 'If you prefer the command line, you can install with winget. You still need to add the bin folder to your PATH afterwards.',
                code: { lang: 'bash', value: 'winget install PostgreSQL.PostgreSQL.16' }
            }
        ],
        tags: ['postgresql', 'installation', 'sql']
    },
    {
        category: 'database',
        title: 'Install PostgreSQL on macOS & Linux',
        icon: 'postgresql',
        description: 'Install and start PostgreSQL with Homebrew on macOS or apt on Ubuntu/Debian.',
        content: [
            {
                type: 'section',
                heading: '1. macOS: install with Homebrew',
                text: 'Homebrew installs PostgreSQL and the command line tools.',
                code: { lang: 'bash', value: 'brew install postgresql@16' }
            },
            {
                type: 'section',
                heading: '2. macOS: start the service',
                text: 'Start PostgreSQL now and have it launch automatically at login.',
                code: { lang: 'bash', value: 'brew services start postgresql@16' }
            },
            {
                type: 'section',
                heading: '3. macOS: add it to your PATH',
                text: 'Versioned Homebrew formulas are not linked automatically. Add this line to ~/.zshrc, then open a new terminal.',
                code: { lang: 'bash', value: 'echo \'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"\' >> ~/.zshrc' },
                callout: { tone: 'success', text: 'On Intel Macs the folder is /usr/local/opt/postgresql@16/bin instead.' }
            },
            {
                type: 'section',
                heading: '4. macOS: create the database',
                text: 'On macOS the default superuser is your own username and has no password.',
                code: {
                    lang: 'bash',
                    value: `createdb devvault
psql devvault`
                }
            },
            {
                type: 'section',
                heading: '5. Linux (Ubuntu/Debian): install',
                text: 'Install the server and the extra contrib modules.',
                code: {
                    lang: 'bash',
                    value: `sudo apt update
sudo apt install postgresql postgresql-contrib`
                }
            },
            {
                type: 'section',
                heading: '6. Linux: start the service',
                text: 'Start it and enable it on boot.',
                code: {
                    lang: 'bash',
                    value: `sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql`
                }
            },
            {
                type: 'section',
                heading: '7. Linux: set a password and create the database',
                text: 'Open psql as the postgres system user, set a password so your Node.js app can log in, then create the database.',
                code: {
                    lang: 'bash',
                    value: `sudo -u postgres psql`
                }
            },
            {
                type: 'section',
                heading: '8. Run these inside psql',
                text: 'Replace the password with your own.',
                code: {
                    lang: 'sql',
                    value: `ALTER USER postgres PASSWORD 'yourpassword';
CREATE DATABASE devvault;
\\q`
                },
                callout: { tone: 'success', text: 'Verify with psql --version. Your DATABASE_URL on Linux will use the postgres user and the password you just set.' }
            }
        ],
        tags: ['postgresql', 'installation', 'sql']
    },
    {
        category: 'database',
        title: 'Connect DevVault to Local PostgreSQL',
        icon: 'postgresql',
        description: 'Configure DATABASE_URL, run the migration, and seed your local database.',
        content: [
            {
                type: 'section',
                heading: '1. Build the connection string',
                text: 'The format is: postgresql://USER:PASSWORD@HOST:PORT/DATABASE. For a local install this is usually the following.',
                code: { lang: 'text', value: 'postgresql://postgres:yourpassword@localhost:5432/devvault' },
                callout: { tone: 'success', text: 'If your password contains special characters such as @ or #, URL-encode them (for example @ becomes %40).' }
            },
            {
                type: 'section',
                heading: '2. Add it to backend/.env',
                text: 'Keep the other variables too. The seed script needs the admin values.',
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
                heading: '3. Run the migration',
                text: 'This creates the tables from your schema. Run it from the backend folder.',
                code: { lang: 'bash', value: 'npm run db:migrate' }
            },
            {
                type: 'section',
                heading: '4. Seed the database',
                text: 'This inserts the categories, tags, documents, and your admin account.',
                code: { lang: 'bash', value: 'npm run db:seed' }
            },
            {
                type: 'section',
                heading: '5. Verify the data',
                text: 'Check that the tables and rows exist.',
                code: {
                    lang: 'bash',
                    value: `psql -U postgres -d devvault -c "SELECT COUNT(*) FROM documents;"
psql -U postgres -d devvault -c "SELECT name, slug FROM categories ORDER BY sort_order;"`
                }
            },
            {
                type: 'section',
                heading: '6. Start the backend',
                text: 'If the server starts without a database error, the connection works.',
                code: { lang: 'bash', value: 'npm run dev' },
                callout: { tone: 'success', text: 'You can browse and edit the data visually with pgAdmin 4, which was installed with PostgreSQL on Windows.' }
            }
        ],
        tags: ['postgresql', 'installation', 'nodejs']
    },
    {
        category: 'database',
        title: 'Supabase Setup: Create a Hosted PostgreSQL Database',
        icon: 'postgresql',
        description: 'Create a free Supabase project and find the right connection string for your backend.',
        content: [
            {
                type: 'section',
                heading: '1. What is Supabase?',
                text: 'Supabase is a hosted platform built on PostgreSQL. For DevVault you only need the database: your Express backend connects to it directly, just like a local PostgreSQL.'
            },
            {
                type: 'section',
                heading: '2. Create an account and project',
                text: 'Sign up at supabase.com, then click New project. Choose an organization, a project name, and the region closest to where your backend will run.'
            },
            {
                type: 'section',
                heading: '3. Set the database password',
                text: 'Supabase asks for a database password when you create the project. Use the generator or your own, and save it immediately.',
                callout: { tone: 'success', text: 'You will need this password in DATABASE_URL. It can be reset later in Project Settings, then Database.' }
            },
            {
                type: 'section',
                heading: '4. Wait for provisioning',
                text: 'The project takes a minute or two to be ready. When the dashboard shows it as healthy, continue.'
            },
            {
                type: 'section',
                heading: '5. Open the connection details',
                text: 'Click the Connect button at the top of the dashboard. You will see several connection string types, and the labels may change over time, so always copy from the dashboard.',
                code: {
                    lang: 'text',
                    value: `Direct connection      port 5432   best for servers with IPv6 support
Session pooler         port 5432   works over IPv4, good default for a backend
Transaction pooler     port 6543   for serverless or short-lived connections`
                }
            },
            {
                type: 'section',
                heading: '6. Which one should I use?',
                text: 'For a persistent Express server on Render, Railway, or your own computer, the Session pooler is the safest choice because it works over IPv4. Direct connections may fail on networks without IPv6 support.'
            },
            {
                type: 'section',
                heading: '7. Replace the password placeholder',
                text: 'The copied string contains [YOUR-PASSWORD]. Replace it with your real password. Note that the pooler username includes your project reference.',
                code: {
                    lang: 'text',
                    value: 'postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres'
                },
                callout: { tone: 'success', text: 'The default database in Supabase is named postgres. You do not need to create a devvault database.' }
            },
            {
                type: 'section',
                heading: '8. Free plan limits',
                text: 'Free projects may be paused after a period of inactivity. If your app stops connecting, open the dashboard and restore the project.'
            }
        ],
        tags: ['postgresql', 'supabase', 'installation']
    },
    {
        category: 'database',
        title: 'Connect DevVault to Supabase',
        icon: 'postgresql',
        description: 'Enable SSL, set DATABASE_URL, run the migration and seed, and secure your tables.',
        content: [
            {
                type: 'section',
                heading: '1. Set DATABASE_URL',
                text: 'Use a separate .env value for Supabase. Keep your local string commented out so you can switch back quickly.',
                code: {
                    lang: 'text',
                    value: `# Local
# DATABASE_URL=postgresql://postgres:localpassword@localhost:5432/devvault

# Supabase (session pooler)
DATABASE_URL=postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres
DATABASE_SSL=true`
                }
            },
            {
                type: 'section',
                heading: '2. Enable SSL in your Pool',
                text: 'Supabase requires encrypted connections. Update db.js so SSL is controlled by an environment variable. This works both locally and in production.',
                code: {
                    lang: 'javascript',
                    value: `const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});`
                }
            },
            {
                type: 'section',
                heading: '3. Run the migration',
                text: 'This creates all tables in your Supabase database.',
                code: { lang: 'bash', value: 'npm run db:migrate' }
            },
            {
                type: 'section',
                heading: '4. Run the seed',
                text: 'This inserts your categories, tags, documents, and admin user.',
                code: { lang: 'bash', value: 'npm run db:seed' }
            },
            {
                type: 'section',
                heading: '5. Inspect the data in the dashboard',
                text: 'Open Table Editor in Supabase to browse your tables and rows. Use SQL Editor to run queries directly.'
            },
            {
                type: 'section',
                heading: '6. Enable Row Level Security',
                text: 'Supabase can expose tables through its own public API. Tables created with SQL have Row Level Security off by default, which means they may be readable with the public anon key. Turn RLS on for every table, including users.',
                code: {
                    lang: 'sql',
                    value: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;`
                },
                callout: { tone: 'success', text: 'Your Express backend connects as the postgres role, which bypasses RLS, so enabling it will not break DevVault. It simply blocks anonymous access through the Supabase API.' }
            },
            {
                type: 'section',
                heading: '7. Use it in production',
                text: 'Add the same DATABASE_URL and DATABASE_SSL=true to your backend host (Render, Railway, etc.). Do not commit these values.'
            },
            {
                type: 'section',
                heading: '8. Local or Supabase: which to use?',
                text: 'Use local PostgreSQL for development, since it is fast and works offline. Use Supabase for the deployed app. Switch by changing DATABASE_URL and DATABASE_SSL in your environment.'
            }
        ],
        tags: ['postgresql', 'supabase', 'deployment', 'security']
    },
    {
        category: 'troubleshooting',
        title: 'Fixing PostgreSQL & Supabase Connection Errors',
        icon: 'bug',
        description: 'Common errors when connecting your Node.js backend to a local PostgreSQL or Supabase database.',
        content: [
            {
                type: 'section',
                heading: '1. psql is not recognized',
                text: 'The PostgreSQL bin folder is not in your PATH. Add it (see the Windows install guide), then open a new terminal. Old terminals do not pick up PATH changes.'
            },
            {
                type: 'section',
                heading: '2. password authentication failed for user "postgres"',
                text: 'The password in DATABASE_URL is wrong. Check for typos, and URL-encode special characters. On Linux you can reset it from the postgres system user.',
                code: {
                    lang: 'bash',
                    value: `sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';`
                }
            },
            {
                type: 'section',
                heading: '3. ECONNREFUSED 127.0.0.1:5432',
                text: 'PostgreSQL is not running or is on a different port. Start the service for your system.',
                code: {
                    lang: 'bash',
                    value: `# Windows: open services.msc and start the postgresql service
# macOS
brew services start postgresql@16
# Linux
sudo systemctl start postgresql`
                }
            },
            {
                type: 'section',
                heading: '4. database "devvault" does not exist',
                text: 'You created the server but not the database. Create it, then run the migration.',
                code: { lang: 'bash', value: 'createdb -U postgres devvault' }
            },
            {
                type: 'section',
                heading: '5. SSL errors',
                text: 'If the error says the server requires encryption or mentions pg_hba.conf with "no encryption", turn SSL on (DATABASE_SSL=true). If the error says the server does not support SSL, you are connecting to local PostgreSQL, so set DATABASE_SSL to false.'
            },
            {
                type: 'section',
                heading: '6. ENOTFOUND or ENETUNREACH with Supabase',
                text: 'The direct connection host uses IPv6, which many networks and hosts do not support. Switch DATABASE_URL to the Session pooler string from the Connect dialog.'
            },
            {
                type: 'section',
                heading: '7. Tenant or user not found (Supabase)',
                text: 'Pooler connections need the username in the form postgres.<project-ref>, not just postgres. Copy the string again from the dashboard.'
            },
            {
                type: 'section',
                heading: '8. Port 5432 already in use',
                text: 'Another PostgreSQL instance may already be running. Stop it, or install on another port such as 5433 and update DATABASE_URL to match.'
            },
            {
                type: 'section',
                heading: '9. Too many connections',
                text: 'Create the Pool once and reuse it, and always release clients obtained with pool.connect(). On Supabase, prefer a pooler connection string.',
                callout: { tone: 'success', text: 'Quick test: run psql with the same DATABASE_URL. If psql connects but Node does not, the problem is in your Pool settings, not the database.' }
            }
        ],
        tags: ['troubleshooting', 'postgresql', 'supabase']
    }
];