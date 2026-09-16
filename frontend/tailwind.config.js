/** @type {import('tailwindcss').Config} */

// Reads an "R G B" CSS variable and supports Tailwind's opacity modifiers
// (e.g. `border-vault-accent/40`) via the standard rgb(var(...) / <alpha-value>) pattern.
function channel(variableName) {
        return ({ opacityValue }) =>
        opacityValue === undefined
            ? `rgb(var(${variableName}))`
            : `rgb(var(${variableName}) / ${opacityValue})`;
    }

    export default {
        darkMode: 'class',
        content: ['./index.html', './src/**/*.{js,jsx}'],
        theme: {
        extend: {
            colors: {
            vault: {
                bg: channel('--vault-bg'),
                panel: channel('--vault-panel'),
                elevated: channel('--vault-elevated'),
                border: channel('--vault-border'),
                accent: channel('--vault-accent'),
                'accent-hover': channel('--vault-accent-hover'),
                // pre-mixed, fixed-alpha tokens — not channel-based, no opacity modifier support
                'accent-soft': 'var(--vault-accent-soft)',
                text: channel('--vault-text'),
                muted: channel('--vault-muted'),
                faint: channel('--vault-faint'),
                success: channel('--vault-success'),
                'success-bg': 'var(--vault-success-bg)',
                danger: channel('--vault-danger'),
                'danger-bg': 'var(--vault-danger-bg)'
            }
            },
            fontFamily: {
            sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
            },
            boxShadow: {
            glow: '0 0 0 1px rgba(124,92,252,0.35), 0 8px 24px rgba(124,92,252,0.18)'
            }
        }
        },
        plugins: []
};
