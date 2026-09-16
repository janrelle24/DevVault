import { useEffect, useState } from 'react';
import { LifeBuoy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../lib/api';

export default function RightRail({ sections, docSlug }) {
    const [activeId, setActiveId] = useState(sections?.[0]?.id);
    const [feedback, setFeedback] = useState(null); // null | 'yes' | 'no'

    useEffect(() => {
        if (!sections?.length) return;
        const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(entry.target.id);
            });
        },
        { rootMargin: '-100px 0px -70% 0px' }
        );
        sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    async function sendFeedback(helpful) {
        setFeedback(helpful ? 'yes' : 'no');
        try {
        await api.sendFeedback(docSlug, helpful);
        } catch {
        // non-critical; keep optimistic UI state
        }
    }

    return (
        <aside className="hidden xl:block w-64 shrink-0 px-6 py-8 space-y-6">
            {sections?.length > 0 && (
                <div>
                <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">ON THIS PAGE</p>
                <nav className="space-y-2 border-l border-vault-border">
                    {sections.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className={`block pl-3 -ml-px border-l-2 text-sm transition-colors ${
                        activeId === s.id
                            ? 'border-vault-accent text-vault-accent font-medium'
                            : 'border-transparent text-vault-muted hover:text-vault-text'
                        }`}
                    >
                        {s.heading}
                    </a>
                    ))}
                </nav>
                </div>
            )}
        
            <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-vault-text mb-1.5">
                <LifeBuoy size={16} className="text-vault-accent" /> Having Issues?
                </div>
                <p className="text-xs text-vault-muted leading-relaxed mb-3">
                Check out the common problems section or ask in our community.
                </p>
                <button className="w-full rounded-lg border border-vault-accent/40 text-vault-accent text-sm font-semibold py-2 hover:bg-vault-accent-soft transition-colors">
                View Troubleshooting
                </button>
            </div>
        
            <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
                <p className="text-sm font-semibold text-vault-text mb-0.5">Was this helpful?</p>
                <p className="text-xs text-vault-muted mb-3">Help us improve this documentation.</p>
                <div className="flex gap-2">
                <button
                    onClick={() => sendFeedback(true)}
                    disabled={feedback !== null}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                    feedback === 'yes'
                        ? 'border-vault-success/50 text-vault-success bg-vault-success-bg'
                        : 'border-vault-border text-vault-muted hover:text-vault-text'
                    }`}
                >
                    <ThumbsUp size={14} /> Yes
                </button>
                <button
                    onClick={() => sendFeedback(false)}
                    disabled={feedback !== null}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                    feedback === 'no'
                        ? 'border-vault-danger/50 text-vault-danger bg-vault-danger-bg'
                        : 'border-vault-border text-vault-muted hover:text-vault-text'
                    }`}
                >
                    <ThumbsDown size={14} /> No
                </button>
                </div>
            </div>
        </aside>
    );
}
