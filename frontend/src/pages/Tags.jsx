import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Breadcrumbs, TagBadge } from '../components/Bits';

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [params, setParams] = useSearchParams();
    const [documents, setDocuments] = useState([]);
    const activeTag = params.get('tag');

    useEffect(() => {
        api.getTags().then(({ tags }) => setTags(tags));
    }, []);

    useEffect(() => {
        api.getDocuments(activeTag ? { tag: activeTag } : {}).then(({ documents }) => setDocuments(documents));
    }, [activeTag]);

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Tags</h1>

        <div className="flex flex-wrap gap-2 mb-8">
            <button
            onClick={() => setParams({})}
            className={`text-xs font-medium rounded-md border px-2.5 py-1 transition-colors ${
                !activeTag ? 'border-vault-accent text-vault-accent bg-vault-accent-soft' : 'border-vault-border text-vault-muted hover:text-white'
            }`}
            >
            All
            </button>
            {tags.map((t) => (
            <button key={t.slug} onClick={() => setParams({ tag: t.slug })}>
                <TagBadge slug={t.slug} name={t.name} />
            </button>
            ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
            <Link
                key={doc.id}
                to={`/docs/${doc.slug}`}
                className="rounded-xl border border-vault-border bg-vault-elevated p-4 hover:border-vault-accent/40 transition-colors"
            >
                <div className="flex items-start gap-3">
                <span className="text-xl">{doc.icon}</span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                    <p className="text-xs text-vault-faint mt-1 line-clamp-2">{doc.description}</p>
                </div>
                </div>
            </Link>
            ))}
        </div>
        </div>
    );
}
