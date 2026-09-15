import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link2, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { api } from '../lib/api';
//import { useAuth } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumbs, TagBadge } from '../components/Bits';
import CodeBlock from '../components/CodeBlock';
import RightRail from '../components/RightRail';

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
}

export default function DocPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [busy, setBusy] = useState(false);
    /*
    useEffect(() => {
        setLoading(true);
        setError('');
        api
        .getDocument(slug)
        .then(({ document }) => {
            setDoc(document);
            setBookmarked(document.isBookmarked);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [slug]);*/
    useEffect(() =>{
        if(!slug) return;
        let cancelled = false;
        api.getDocument(slug)
            .then(({ document }) =>{
                if(cancelled) return;
                setDoc(document);
                setBookmarked(document.isbookmarked);
            })
            .catch((err) =>{
                if(!cancelled){
                    setError(err.message);
                }
            })
            .finally(() => {
                if(!cancelled){
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [slug]);

    function copyLink() {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function toggleBookmark() {
        if (!user) return;
        setBusy(true);
        try {
        if (bookmarked) {
            await api.removeBookmark(slug);
        } else {
            await api.addBookmark(slug);
        }
        setBookmarked((v) => !v);
        } catch {
        // keep prior state on failure
        } finally {
        setBusy(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-vault-muted text-sm">Loading document…</div>;
    }

    if (error) {
        return (
        <div className="p-8">
            <p className="text-vault-danger text-sm">{error}</p>
        </div>
        );
    }

    if (!doc) return null;

    const sections = (doc.content || [])
        .map((block, i) => ({
        id: `section-${i}`,
        heading: block.heading
        }))
        .filter((s) => s.heading);

    return (
        <div className="flex">
        <div className="flex-1 min-w-0 px-6 lg:px-10 py-8 max-w-3xl">
            <Breadcrumbs
            items={[
                { label: 'Home', to: '/' },
                ...(doc.category_name
                ? [{ label: doc.category_name, to: `/categories/${doc.category_slug}` }]
                : []),
                { label: doc.title }
            ]}
            />

            <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
                <span className="text-3xl">{doc.icon}</span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{doc.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-elevated px-3 py-2 text-xs font-medium text-vault-muted hover:text-white transition-colors"
                >
                <Link2 size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                onClick={toggleBookmark}
                disabled={!user || busy}
                title={!user ? 'Log in to bookmark documents' : undefined}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    bookmarked
                    ? 'border-vault-accent/40 text-vault-accent bg-vault-accent-soft'
                    : 'border-vault-border bg-vault-elevated text-vault-muted hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
            </div>
            </div>

            {doc.description && (
            <p className="text-vault-muted leading-relaxed mb-4">{doc.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-8">
            {doc.tags?.map((t) => (
                <TagBadge key={t.slug} slug={t.slug} name={t.name} />
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs text-vault-faint">
                <Clock size={12} /> Updated {timeAgo(doc.updated_at)}
            </span>
            </div>

            <hr className="border-vault-border mb-8" />

            <div className="space-y-10">
            {(doc.content || []).map((block, i) => (
                <section key={i} id={`section-${i}`} className="scroll-mt-24">
                {block.heading && (
                    <h2 className="text-xl font-bold text-white mb-2">{block.heading}</h2>
                )}
                {block.text && (
                    <p className="text-vault-muted leading-relaxed mb-4">{block.text}</p>
                )}
                {block.code && <CodeBlock lang={block.code.lang} value={block.code.value} />}
                {block.callout && (
                    <div
                    className={`mt-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
                        block.callout.tone === 'success'
                        ? 'border-vault-success/30 bg-vault-success-bg text-vault-success'
                        : 'border-vault-border bg-vault-elevated text-vault-muted'
                    }`}
                    >
                    {block.callout.tone === 'success' && (
                        <span className="h-4 w-4 rounded-full bg-vault-success/20 flex items-center justify-center text-[10px]">
                        ✓
                        </span>
                    )}
                    {block.callout.text}
                    </div>
                )}
                </section>
            ))}
            </div>
        </div>

        <RightRail sections={sections} docSlug={slug} />
        </div>
    );
}
