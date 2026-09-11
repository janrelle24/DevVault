import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Bits';

export function CategoriesList() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.getCategories().then(({ categories }) => setCategories(categories));
    }, []);

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c) => (
            <Link
                key={c.slug}
                to={`/categories/${c.slug}`}
                className="rounded-xl border border-vault-border bg-vault-elevated p-4 hover:border-vault-accent/40 transition-colors"
            >
                <span className="text-2xl block mb-2">{c.icon}</span>
                <span className="block text-sm font-semibold text-white truncate">{c.name}</span>
                <span className="block text-xs text-vault-faint mt-0.5">{c.doc_count} docs</span>
            </Link>
            ))}
        </div>
        </div>
    );
    }

    export function CategoryDetail() {
    const { slug } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        api.getCategory(slug).then(setData);
    }, [slug]);

    if (!data) return <div className="p-8 text-vault-muted text-sm">Loading…</div>;

    const { category, documents } = data;

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }, { label: category.name }]} />
        <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{category.name}</h1>
        </div>

        {documents.length === 0 ? (
            <p className="text-sm text-vault-muted">No documents in this category yet.</p>
        ) : (
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
        )}
        </div>
    );
}
