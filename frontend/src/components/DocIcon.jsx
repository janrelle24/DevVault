import {
    Rocket, Bot, Bug, FileText, BookOpen, Hand
} from 'lucide-react';
import {
    SiReact, SiNodedotjs, SiExpress, SiPostgresql,
    SiJsonwebtokens, SiVercel, SiVite, SiJavascript, SiTailwindcss
} from 'react-icons/si';

  // Brand logos get their official color. Dark logos use currentColor so they adapt to dark mode.
const ICONS = {
    // logos
    react:      { Icon: SiReact,         color: '#61DAFB' },
    nodejs:     { Icon: SiNodedotjs,     color: '#5FA04E' },
    express:    { Icon: SiExpress },
    postgresql: { Icon: SiPostgresql,    color: '#4169E1' },
    jwt:        { Icon: SiJsonwebtokens, color: '#D63AFF' },
    vercel:     { Icon: SiVercel },
    vite:       { Icon: SiVite,          color: '#646CFF' },
    javascript: { Icon: SiJavascript,    color: '#F7DF1E' },
    tailwind:   { Icon: SiTailwindcss,   color: '#06B6D4' },

    // generic (Lucide)
    rocket:      { Icon: Rocket },
    bot:         { Icon: Bot },
    bug:         { Icon: Bug },
    'file-text': { Icon: FileText },
    'book-open': { Icon: BookOpen },
    hand:        { Icon: Hand }
};


export default function DocIcon({ name, size = 20, className = '' }) {
    const entry = ICONS[name];
    if (entry) {
        const { Icon, color } = entry;
        return <Icon size={size} color={color} className={className} aria-hidden="true" />;
    }
    // Fallback so old emoji values still render
    return <span className={className} aria-hidden="true">{name || '📄'}</span>;
}