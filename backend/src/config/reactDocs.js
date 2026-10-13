// backend/src/config/reactDocs.js
// React learning notes. Category: 'frontend-react'

module.exports = [
    {
        category: 'frontend-react',
        title: 'React Components & Props',
        icon: 'react',
        description: 'Learn how to build reusable components with JSX and pass data to them using props.',
        content: [
            {
                type: 'section',
                heading: '1. What is a component?',
                text: 'A component is a JavaScript function that returns JSX (HTML-like markup). Component names must start with a capital letter.',
                code: {
                    lang: 'jsx',
                    value: `function Welcome() {
    return <h1>Hello, DevVault!</h1>;
}

export default Welcome;`
                }
            },
            {
                type: 'section',
                heading: '2. Use a component',
                text: 'Import the component and use it like an HTML tag.',
                code: {
                    lang: 'jsx',
                    value: `import Welcome from './Welcome';

function App() {
    return <Welcome />;
}

export default App;`
                }
            },
            {
                type: 'section',
                heading: '3. Pass data with props',
                text: 'Props let a parent component send values to a child. Destructure them in the function parameters.',
                code: {
                    lang: 'jsx',
                    value: `function Greeting({ name, role }) {
    return (
        <p>
            Hello, {name}! You are a {role}.
        </p>
    );
}

// Usage
<Greeting name="Jan" role="developer" />`
                }
            },
            {
                type: 'section',
                heading: '4. Default prop values',
                text: 'Give a prop a default value so the component still works when it is not provided.',
                code: {
                    lang: 'jsx',
                    value: `function Button({ label = 'Click me', onClick }) {
    return <button onClick={onClick}>{label}</button>;
}`
                }
            },
            {
                type: 'section',
                heading: '5. The children prop',
                text: 'Anything placed between the opening and closing tags of a component is available as children. This is useful for wrappers like cards and layouts.',
                code: {
                    lang: 'jsx',
                    value: `function Card({ children }) {
    return <div className="card">{children}</div>;
}

// Usage
<Card>
    <h2>Title</h2>
    <p>Card content goes here.</p>
</Card>`
                },
                callout: { tone: 'success', text: 'Props are read-only. Never modify them inside the child component.' }
            }
        ],
        tags: ['react', 'javascript', 'components']
    },
    {
        category: 'frontend-react',
        title: 'React useState Hook',
        icon: 'react',
        description: 'Store and update values that change over time inside a component.',
        content: [
            {
                type: 'section',
                heading: '1. Import useState',
                text: 'Hooks are imported from the react package.',
                code: { lang: 'jsx', value: "import { useState } from 'react';" }
            },
            {
                type: 'section',
                heading: '2. Create a state variable',
                text: 'useState returns the current value and a function to update it. The argument is the initial value.',
                code: {
                    lang: 'jsx',
                    value: `function Counter() {
    const [count, setCount] = useState(0);

    return (
        <button onClick={() => setCount(count + 1)}>
            Clicked {count} times
        </button>
    );
}`
                }
            },
            {
                type: 'section',
                heading: '3. Update based on the previous value',
                text: 'When the new value depends on the old one, pass a function to the setter. This avoids stale values.',
                code: { lang: 'jsx', value: 'setCount((prev) => prev + 1);' }
            },
            {
                type: 'section',
                heading: '4. Object state',
                text: 'Never mutate state directly. Copy the object with the spread operator and change only what you need.',
                code: {
                    lang: 'jsx',
                    value: `const [user, setUser] = useState({ name: '', email: '' });

setUser({ ...user, name: 'Jan' });`
                }
            },
            {
                type: 'section',
                heading: '5. Array state',
                text: 'Create a new array instead of using push() or splice().',
                code: {
                    lang: 'jsx',
                    value: `const [items, setItems] = useState([]);

// Add
setItems([...items, newItem]);

// Remove
setItems(items.filter((item) => item.id !== id));`
                },
                callout: { tone: 'success', text: 'Calling a setter re-renders the component with the new value.' }
            }
        ],
        tags: ['react', 'hooks', 'state']
    },
    {
        category: 'frontend-react',
        title: 'React useEffect Hook',
        icon: 'react',
        description: 'Run side effects such as fetching data, timers, and event listeners.',
        content: [
            {
                type: 'section',
                heading: '1. Basic useEffect',
                text: 'useEffect runs after the component renders. The second argument is the dependency array.',
                code: {
                    lang: 'jsx',
                    value: `import { useEffect } from 'react';

useEffect(() => {
    console.log('Component rendered');
});`
                }
            },
            {
                type: 'section',
                heading: '2. Run only once',
                text: 'Use an empty dependency array to run the effect only when the component first mounts.',
                code: {
                    lang: 'jsx',
                    value: `useEffect(() => {
    document.title = 'DevVault';
}, []);`
                }
            },
            {
                type: 'section',
                heading: '3. Run when a value changes',
                text: 'Add values to the dependency array to re-run the effect whenever they change.',
                code: {
                    lang: 'jsx',
                    value: `useEffect(() => {
    console.log('Search changed:', search);
}, [search]);`
                }
            },
            {
                type: 'section',
                heading: '4. Cleanup function',
                text: 'Return a function to clean up timers, subscriptions, or event listeners when the component unmounts.',
                code: {
                    lang: 'jsx',
                    value: `useEffect(() => {
    const handleKey = (e) => {
        if (e.ctrlKey && e.key === 'k') {
            console.log('Open search');
        }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
}, []);`
                },
                callout: { tone: 'success', text: 'This is the pattern behind a Ctrl+K search shortcut.' }
            }
        ],
        tags: ['react', 'hooks']
    },
    {
        category: 'frontend-react',
        title: 'Lists & Conditional Rendering',
        icon: 'react',
        description: 'Render arrays of data and show or hide UI based on conditions.',
        content: [
            {
                type: 'section',
                heading: '1. Render a list with map()',
                text: 'Use map() to turn an array into JSX elements. Every item needs a unique key prop.',
                code: {
                    lang: 'jsx',
                    value: `const docs = [
    { id: 1, title: 'React Installation' },
    { id: 2, title: 'Node.js API Setup' }
];

function DocList() {
    return (
        <ul>
            {docs.map((doc) => (
                <li key={doc.id}>{doc.title}</li>
            ))}
        </ul>
    );
}`
                },
                callout: { tone: 'success', text: 'Use a stable id for key. Avoid the array index when items can be reordered or removed.' }
            },
            {
                type: 'section',
                heading: '2. Show something only if true',
                text: 'Use the && operator to render an element only when a condition is true.',
                code: { lang: 'jsx', value: '{isAdmin && <button>Delete</button>}' }
            },
            {
                type: 'section',
                heading: '3. Choose between two options',
                text: 'Use a ternary operator for if/else inside JSX.',
                code: { lang: 'jsx', value: '{isLoggedIn ? <Dashboard /> : <Login />}' }
            },
            {
                type: 'section',
                heading: '4. Early return',
                text: 'Return early for loading, error, or empty states to keep the main JSX clean.',
                code: {
                    lang: 'jsx',
                    value: `if (loading) return <p>Loading...</p>;
if (error) return <p>Something went wrong.</p>;
if (docs.length === 0) return <p>No documents found.</p>;`
                }
            }
        ],
        tags: ['react', 'javascript']
    },
    {
        category: 'frontend-react',
        title: 'React Forms & Controlled Inputs',
        icon: 'react',
        description: 'Handle user input with controlled components and form submission.',
        content: [
            {
                type: 'section',
                heading: '1. Controlled input',
                text: 'Store the input value in state and update it on every change. React is then the single source of truth.',
                code: {
                    lang: 'jsx',
                    value: `const [search, setSearch] = useState('');

<input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search docs..."
/>`
                }
            },
            {
                type: 'section',
                heading: '2. Handle multiple fields',
                text: 'Give each input a name and use one change handler for the whole form.',
                code: {
                    lang: 'jsx',
                    value: `const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

<input name="email" value={form.email} onChange={handleChange} />
<input name="password" type="password" value={form.password} onChange={handleChange} />`
                }
            },
            {
                type: 'section',
                heading: '3. Submit the form',
                text: 'Call preventDefault() to stop the browser from reloading the page.',
                code: {
                    lang: 'jsx',
                    value: `const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
};

<form onSubmit={handleSubmit}>
    {/* inputs */}
    <button type="submit">Log in</button>
</form>`
                },
                callout: { tone: 'success', text: 'Always validate on the backend too. Frontend validation is only for user experience.' }
            }
        ],
        tags: ['react', 'forms', 'state']
    },
    {
        category: 'frontend-react',
        title: 'Fetching API Data in React',
        icon: 'react',
        description: 'Load data from your backend with fetch, useEffect, and loading and error states.',
        content: [
            {
                type: 'section',
                heading: '1. Set up state',
                text: 'Track the data, the loading status, and any error separately.',
                code: {
                    lang: 'jsx',
                    value: `const [docs, setDocs] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);`
                }
            },
            {
                type: 'section',
                heading: '2. Fetch inside useEffect',
                text: 'Call the API when the component mounts. Replace the URL with your backend address.',
                code: {
                    lang: 'jsx',
                    value: `useEffect(() => {
    fetch('http://localhost:5000/api/documents')
        .then((res) => {
            if (!res.ok) throw new Error('Request failed');
            return res.json();
        })
        .then((data) => setDocs(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
}, []);`
                }
            },
            {
                type: 'section',
                heading: '3. Render each state',
                text: 'Show a message for loading and error before rendering the data.',
                code: {
                    lang: 'jsx',
                    value: `if (loading) return <p>Loading...</p>;
if (error) return <p>{error}</p>;

return (
    <ul>
        {docs.map((doc) => (
            <li key={doc.id}>{doc.title}</li>
        ))}
    </ul>
);`
                }
            },
            {
                type: 'section',
                heading: '4. Send an authenticated request',
                text: 'Protected routes need the JWT in the Authorization header.',
                code: {
                    lang: 'jsx',
                    value: `fetch('http://localhost:5000/api/admin/documents', {
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
    }
});`
                },
                callout: { tone: 'success', text: 'Store the API base URL in a Vite env variable such as VITE_API_URL instead of hardcoding it.' }
            }
        ],
        tags: ['react', 'api', 'hooks']
    },
    {
        category: 'frontend-react',
        title: 'React Router Basics',
        icon: 'react',
        description: 'Add multiple pages, navigation links, and dynamic URL parameters to a React app.',
        content: [
            {
                type: 'section',
                heading: '1. Install React Router',
                text: 'Add the routing package to your project.',
                code: { lang: 'bash', value: 'npm install react-router-dom' }
            },
            {
                type: 'section',
                heading: '2. Wrap the app',
                text: 'Wrap your app in BrowserRouter, usually in main.jsx.',
                code: {
                    lang: 'jsx',
                    value: `import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);`
                }
            },
            {
                type: 'section',
                heading: '3. Define routes',
                text: 'Map each URL path to a page component.',
                code: {
                    lang: 'jsx',
                    value: `import { Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs/:slug" element={<DocPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}`
                }
            },
            {
                type: 'section',
                heading: '4. Navigate with Link',
                text: 'Use Link instead of the a tag so the page does not fully reload.',
                code: {
                    lang: 'jsx',
                    value: `import { Link } from 'react-router-dom';

<Link to="/docs/react-installation">React Installation</Link>`
                }
            },
            {
                type: 'section',
                heading: '5. Read URL parameters',
                text: 'Use useParams to read dynamic parts of the URL.',
                code: {
                    lang: 'jsx',
                    value: `import { useParams } from 'react-router-dom';

function DocPage() {
    const { slug } = useParams();
    return <h1>{slug}</h1>;
}`
                }
            },
            {
                type: 'section',
                heading: '6. Protect a route',
                text: 'Redirect users who are not logged in or are not admins.',
                code: {
                    lang: 'jsx',
                    value: `import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, adminOnly, children }) {
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}`
                },
                callout: { tone: 'success', text: 'This is the same idea as the ProtectedRoute used in the DevVault admin area.' }
            }
        ],
        tags: ['react', 'routing']
    },
    {
        category: 'frontend-react',
        title: 'React Context API',
        icon: 'react',
        description: 'Share data such as the logged-in user or theme across components without prop drilling.',
        content: [
            {
                type: 'section',
                heading: '1. Create the context',
                text: 'Create a context and a provider component that holds the shared state.',
                code: {
                    lang: 'jsx',
                    value: `import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}`
                }
            },
            {
                type: 'section',
                heading: '2. Create a custom hook',
                text: 'Wrap useContext in a small hook so components stay clean.',
                code: {
                    lang: 'jsx',
                    value: `export function useAuth() {
    return useContext(AuthContext);
}`
                }
            },
            {
                type: 'section',
                heading: '3. Wrap the app',
                text: 'Any component inside the provider can now read the context.',
                code: {
                    lang: 'jsx',
                    value: `<AuthProvider>
    <App />
</AuthProvider>`
                }
            },
            {
                type: 'section',
                heading: '4. Use the context',
                text: 'Call the custom hook in any child component.',
                code: {
                    lang: 'jsx',
                    value: `function Navbar() {
    const { user } = useAuth();

    return <span>{user ? user.name : 'Guest'}</span>;
}`
                },
                callout: { tone: 'success', text: 'Use context for global data like auth and theme. For local state, plain useState is enough.' }
            }
        ],
        tags: ['react', 'hooks', 'state', 'auth']
    }
];