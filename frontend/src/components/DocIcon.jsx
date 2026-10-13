import {
    Rocket, Bot, Bug, FileText, BookOpen, Hand,
    Database, ShieldCheck, Globe, Route as RouteIcon, Palette, Download,
    Anchor, Layers, Component as ComponentIcon, ClipboardList, Settings
} from 'lucide-react';
import {
    SiReact, SiNodedotjs, SiExpress, SiPostgresql,
    SiJsonwebtokens, SiVercel, SiVite, SiJavascript, SiTailwindcss,
    SiSupabase, SiGit
} from 'react-icons/si';
import { TAG_ICONS } from '../constants/tagIcons';

// Brand logos get their official color. Dark logos use currentColor so they adapt to dark mode.
const tailwind = { Icon: SiTailwindcss, color: '#06B6D4' };

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
    supabase:   { Icon: SiSupabase,      color: '#3FCF8E' },
    git:        { Icon: SiGit,           color: '#F05032' },
    tailwind,
    tailwindcss: tailwind, // alias: the seed data uses "tailwindcss"

    // generic (Lucide)
    rocket:         { Icon: Rocket },
    bot:            { Icon: Bot },
    bug:            { Icon: Bug },
    'file-text':    { Icon: FileText },
    'book-open':    { Icon: BookOpen },
    hand:           { Icon: Hand },
    database:       { Icon: Database },
    'shield-check': { Icon: ShieldCheck },
    globe:          { Icon: Globe },
    route:          { Icon: RouteIcon },
    palette:        { Icon: Palette },
    download:       { Icon: Download },
    anchor:         { Icon: Anchor },
    layers:         { Icon: Layers },
    component:      { Icon: ComponentIcon },
    'clipboard-list': { Icon: ClipboardList },
    settings:       { Icon: Settings }
};

export default function DocIcon({ name, size = 20, className = '' }) {
    const entry = ICONS[name];
    if (entry) {
        const { Icon, color } = entry;
        return <Icon size={size} color={color} className={className} aria-hidden="true" />;
    }

    // Old emoji values still render as text
    if (name && /\p{Extended_Pictographic}/u.test(name)) {
        return <span className={className} aria-hidden="true">{name}</span>;
    }

    // Unknown icon name: show a generic icon instead of printing the raw word
    return <FileText size={size} className={className} aria-hidden="true" />;
}

// Small icon for a tag chip. Usage: <TagIcon slug={tag.slug} />
export function TagIcon({ slug, size = 14, className = '' }) {
    const key = TAG_ICONS[slug];
    if (!key) return null;
    return <DocIcon name={key} size={size} className={className} />;
}
