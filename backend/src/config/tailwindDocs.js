// backend/src/config/tailwindDocs.js
// Tailwind CSS learning notes (Tailwind v4 with Vite). Category: 'frontend-react'

module.exports = [
    {
        category: 'frontend-react',
        title: 'Tailwind CSS Setup with Vite',
        icon: 'tailwindcss',
        description: 'Install and configure Tailwind CSS v4 in a React + Vite project.',
        content: [
            {
                type: 'section',
                heading: '1. Install Tailwind CSS',
                text: 'Install Tailwind and its official Vite plugin.',
                code: { lang: 'bash', value: 'npm install tailwindcss @tailwindcss/vite' }
            },
            {
                type: 'section',
                heading: '2. Add the Vite plugin',
                text: 'Open vite.config.js and register the Tailwind plugin.',
                code: {
                    lang: 'javascript',
                    value: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()]
});`
                }
            },
            {
                type: 'section',
                heading: '3. Import Tailwind in your CSS',
                text: 'Replace the contents of src/index.css with a single import line.',
                code: { lang: 'css', value: '@import "tailwindcss";' }
            },
            {
                type: 'section',
                heading: '4. Make sure the CSS is loaded',
                text: 'Import the CSS file once in main.jsx.',
                code: { lang: 'jsx', value: "import './index.css';" }
            },
            {
                type: 'section',
                heading: '5. Test it',
                text: 'Add a few utility classes to any element and start the dev server.',
                code: {
                    lang: 'jsx',
                    value: `<h1 className="text-3xl font-bold text-indigo-600">
    Tailwind is working!
</h1>`
                },
                callout: { tone: 'success', text: 'If the heading is large, bold, and indigo, your setup is complete. No tailwind.config.js is needed in v4.' }
            }
        ],
        tags: ['tailwind-css', 'vite', 'styling']
    },
    {
        category: 'frontend-react',
        title: 'Tailwind Utility Classes Cheat Sheet',
        icon: 'tailwindcss',
        description: 'The most common Tailwind utility classes for spacing, typography, colors, borders, and sizing.',
        content: [
            {
                type: 'section',
                heading: '1. Spacing (padding & margin)',
                text: 'The number is a spacing scale where 1 equals 0.25rem (4px). Use p for padding and m for margin, with x, y, t, r, b, l for direction.',
                code: {
                    lang: 'text',
                    value: `p-4      padding on all sides
px-6     padding left and right
py-2     padding top and bottom
mt-8     margin top
mx-auto  center horizontally
space-y-4  vertical gap between children`
                }
            },
            {
                type: 'section',
                heading: '2. Typography',
                text: 'Control font size, weight, alignment, and spacing.',
                code: {
                    lang: 'text',
                    value: `text-sm  text-base  text-xl  text-3xl
font-medium  font-semibold  font-bold
text-center  text-left
leading-relaxed   line height
tracking-tight    letter spacing
truncate          single line with ellipsis`
                }
            },
            {
                type: 'section',
                heading: '3. Colors',
                text: 'Colors follow the pattern property-color-shade, where shade runs from 50 (lightest) to 950 (darkest).',
                code: {
                    lang: 'text',
                    value: `text-gray-700
bg-indigo-600
border-slate-200
hover:bg-indigo-700
bg-indigo-600/50   50% opacity`
                }
            },
            {
                type: 'section',
                heading: '4. Borders, radius & shadows',
                text: 'Round corners, add borders, and give elements depth.',
                code: {
                    lang: 'text',
                    value: `border  border-2  border-gray-200
rounded  rounded-lg  rounded-full
shadow  shadow-md  shadow-lg
ring-2 ring-indigo-500   focus ring`
                }
            },
            {
                type: 'section',
                heading: '5. Width & height',
                text: 'Size elements with fixed values, fractions, or viewport units.',
                code: {
                    lang: 'text',
                    value: `w-64  w-1/2  w-full  max-w-md
h-10  h-screen  min-h-screen`
                },
                callout: { tone: 'success', text: 'Tailwind is mobile-first. Unprefixed classes apply to every screen size.' }
            }
        ],
        tags: ['tailwind-css', 'styling']
    },
    {
        category: 'frontend-react',
        title: 'Tailwind Flexbox & Grid Layout',
        icon: 'tailwindcss',
        description: 'Build page layouts with Tailwind flex and grid utilities.',
        content: [
            {
                type: 'section',
                heading: '1. Flex row',
                text: 'Add flex to a parent to place children in a row. Use gap for spacing between them.',
                code: {
                    lang: 'jsx',
                    value: `<div className="flex items-center gap-4">
    <img src="/logo.png" className="h-8 w-8" />
    <span>DevVault</span>
</div>`
                }
            },
            {
                type: 'section',
                heading: '2. Align & justify',
                text: 'justify-* controls the main axis and items-* controls the cross axis.',
                code: {
                    lang: 'jsx',
                    value: `<nav className="flex items-center justify-between px-6 py-4">
    <span>Logo</span>
    <div>Menu</div>
</nav>`
                }
            },
            {
                type: 'section',
                heading: '3. Flex column',
                text: 'Use flex-col to stack children vertically.',
                code: {
                    lang: 'jsx',
                    value: `<div className="flex flex-col gap-2">
    <p>One</p>
    <p>Two</p>
</div>`
                }
            },
            {
                type: 'section',
                heading: '4. Grid layout',
                text: 'Create equal columns with grid-cols-*.',
                code: {
                    lang: 'jsx',
                    value: `<div className="grid grid-cols-3 gap-6">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>`
                }
            },
            {
                type: 'section',
                heading: '5. Sidebar + content layout',
                text: 'A common dashboard layout: fixed-width sidebar and a flexible main area.',
                code: {
                    lang: 'jsx',
                    value: `<div className="flex min-h-screen">
    <aside className="w-64 shrink-0 border-r border-gray-200 p-4">
        Sidebar
    </aside>
    <main className="flex-1 p-8">
        Content
    </main>
</div>`
                },
                callout: { tone: 'success', text: 'This is the same structure used for the DevVault documentation layout.' }
            },
            {
                type: 'section',
                heading: '6. Center anything',
                text: 'The quickest way to center an element both ways.',
                code: {
                    lang: 'jsx',
                    value: `<div className="flex min-h-screen items-center justify-center">
    <div>Centered</div>
</div>`
                }
            }
        ],
        tags: ['tailwind-css', 'styling']
    },
    {
        category: 'frontend-react',
        title: 'Tailwind Responsive Design, Hover & Dark Mode',
        icon: 'tailwindcss',
        description: 'Use breakpoint, state, and dark mode prefixes to make your UI responsive and interactive.',
        content: [
            {
                type: 'section',
                heading: '1. Breakpoint prefixes',
                text: 'Tailwind is mobile-first. Add a prefix to apply a style from that screen width and up.',
                code: {
                    lang: 'text',
                    value: `sm:   640px and up
md:   768px and up
lg:   1024px and up
xl:   1280px and up
2xl:  1536px and up`
                }
            },
            {
                type: 'section',
                heading: '2. Responsive grid',
                text: 'One column on mobile, two on tablets, three on desktop.',
                code: {
                    lang: 'jsx',
                    value: `<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* cards */}
</div>`
                }
            },
            {
                type: 'section',
                heading: '3. Hide or show by screen size',
                text: 'Show a mobile menu button only on small screens and the full nav on large screens.',
                code: {
                    lang: 'jsx',
                    value: `<button className="lg:hidden">Menu</button>
<nav className="hidden lg:flex gap-6">...</nav>`
                }
            },
            {
                type: 'section',
                heading: '4. State variants',
                text: 'Prefix a class with hover:, focus:, active:, or disabled: to apply it only in that state.',
                code: {
                    lang: 'jsx',
                    value: `<button className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 disabled:opacity-50">
    Save
</button>`
                }
            },
            {
                type: 'section',
                heading: '5. Transitions',
                text: 'Add transition so state changes animate smoothly.',
                code: {
                    lang: 'jsx',
                    value: `<div className="transition duration-200 hover:-translate-y-1 hover:shadow-lg">
    Card
</div>`
                }
            },
            {
                type: 'section',
                heading: '6. Dark mode',
                text: 'Use the dark: prefix. By default it follows the operating system setting.',
                code: {
                    lang: 'jsx',
                    value: `<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    Content
</div>`
                }
            },
            {
                type: 'section',
                heading: '7. Toggle dark mode manually',
                text: 'To control dark mode with a class on the html element, add this line to your CSS (Tailwind v4), then toggle the dark class with JavaScript.',
                code: {
                    lang: 'css',
                    value: `@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));`
                },
                callout: { tone: 'success', text: 'Toggle with document.documentElement.classList.toggle("dark").' }
            }
        ],
        tags: ['tailwind-css', 'styling']
    },
    {
        category: 'frontend-react',
        title: 'Tailwind Reusable Component Patterns',
        icon: 'tailwindcss',
        description: 'Copy-ready button, card, input, and badge components styled with Tailwind in React.',
        content: [
            {
                type: 'section',
                heading: '1. Button',
                text: 'A primary button with hover, focus, and disabled states.',
                code: {
                    lang: 'jsx',
                    value: `function Button({ children, ...props }) {
    return (
        <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
        >
            {children}
        </button>
    );
}`
                }
            },
            {
                type: 'section',
                heading: '2. Card',
                text: 'A simple container with a border, rounded corners, and a soft shadow.',
                code: {
                    lang: 'jsx',
                    value: `function Card({ title, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <div className="text-gray-600">{children}</div>
        </div>
    );
}`
                }
            },
            {
                type: 'section',
                heading: '3. Input field',
                text: 'A text input with a visible focus ring.',
                code: {
                    lang: 'jsx',
                    value: `<input
    type="text"
    placeholder="Search docs..."
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
/>`
                }
            },
            {
                type: 'section',
                heading: '4. Badge / tag',
                text: 'A small pill used for tags and statuses.',
                code: {
                    lang: 'jsx',
                    value: `<span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
    React
</span>`
                }
            },
            {
                type: 'section',
                heading: '5. Callout box',
                text: 'A success message box similar to the callouts used in DevVault docs.',
                code: {
                    lang: 'jsx',
                    value: `<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
    Your setup is complete.
</div>`
                }
            },
            {
                type: 'section',
                heading: '6. Variants with a lookup object',
                text: 'Avoid building class names dynamically. Map each variant to a full class string so Tailwind can detect it.',
                code: {
                    lang: 'jsx',
                    value: `const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
};

function Button({ variant = 'primary', children }) {
    return (
        <button className={'rounded-lg px-4 py-2 ' + variants[variant]}>
            {children}
        </button>
    );
}`
                },
                callout: { tone: 'success', text: 'Never write something like "bg-" + color + "-600". Tailwind scans for complete class names and will not generate it.' }
            }
        ],
        tags: ['tailwind-css', 'react', 'components', 'styling']
    },
    {
        category: 'frontend-react',
        title: 'Customizing the Tailwind Theme',
        icon: 'tailwindcss',
        description: 'Add your own colors, fonts, and breakpoints using the @theme directive in Tailwind v4.',
        content: [
            {
                type: 'section',
                heading: '1. Open your CSS file',
                text: 'In Tailwind v4, theme customization lives in CSS instead of tailwind.config.js. Add an @theme block after the import.',
                code: { lang: 'css', value: '@import "tailwindcss";' }
            },
            {
                type: 'section',
                heading: '2. Add custom colors',
                text: 'Define a color variable with the --color-* prefix. Tailwind generates bg-, text-, and border- utilities automatically.',
                code: {
                    lang: 'css',
                    value: `@theme {
    --color-brand: #4f46e5;
    --color-brand-dark: #3730a3;
}`
                }
            },
            {
                type: 'section',
                heading: '3. Use the custom colors',
                text: 'The new colors work like any built-in color.',
                code: {
                    lang: 'jsx',
                    value: `<button className="bg-brand text-white hover:bg-brand-dark">
    Save
</button>`
                }
            },
            {
                type: 'section',
                heading: '4. Add a custom font',
                text: 'Use --font-* to register a font family.',
                code: {
                    lang: 'css',
                    value: `@theme {
    --font-display: "Inter", sans-serif;
}`
                },
                callout: { tone: 'success', text: 'This creates a font-display class you can use in your JSX.' }
            },
            {
                type: 'section',
                heading: '5. Add a custom breakpoint',
                text: 'Use --breakpoint-* to add your own screen size.',
                code: {
                    lang: 'css',
                    value: `@theme {
    --breakpoint-3xl: 120rem;
}`
                }
            },
            {
                type: 'section',
                heading: '6. Use arbitrary values for one-offs',
                text: 'For a single custom value, use square brackets instead of changing the theme.',
                code: {
                    lang: 'jsx',
                    value: `<div className="w-[320px] bg-[#1e293b] mt-[13px]">
    One-off styles
</div>`
                }
            }
        ],
        tags: ['tailwind-css', 'styling']
    }
];