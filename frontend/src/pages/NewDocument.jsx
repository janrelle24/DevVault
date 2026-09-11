import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Bits';

export default function NewDocument() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sections, setSections] = useState([{ heading: '', text: '', code: '' }]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.getCategories().then(({ categories }) => setCategories(categories));
    }, []);

    function updateSection(i, field, value) {
        setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    }

    function addSection() {
        setSections((prev) => [...prev, { heading: '', text: '', code: '' }]);
    }

    function removeSection(i) {
        setSections((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!user) {
        setError('Log in to create a document.');
        return;
        }
        setLoading(true);
        try {
        const content = sections
            .filter((s) => s.heading || s.text || s.code)
            .map((s) => ({
            type: 'section',
            heading: s.heading,
            text: s.text,
            ...(s.code ? { code: { lang: 'bash', value: s.code } } : {})
            }));

        const { document } = await api.createDocument({
            title,
            description,
            categoryId: categoryId || null,
            content
        });
        navigate(`/docs/${document.slug}`);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="px-6 lg:px-10 py-8 max-w-2xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'New Document' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">New Document</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">Title</label>
            <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors"
                placeholder="e.g. Docker Setup Guide"
            />
            </div>

            <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors resize-none"
                placeholder="Short summary shown under the title"
            />
            </div>

            <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">Category</label>
            <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors"
            >
                <option value="">No category</option>
                {categories.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                </option>
                ))}
            </select>
            </div>

            <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-vault-muted">Sections</label>
                <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1 text-xs text-vault-accent hover:underline"
                >
                <Plus size={13} /> Add section
                </button>
            </div>

            <div className="space-y-4">
                {sections.map((s, i) => (
                <div key={i} className="rounded-lg border border-vault-border bg-vault-elevated p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                    <input
                        value={s.heading}
                        onChange={(e) => updateSection(i, 'heading', e.target.value)}
                        placeholder={`Step ${i + 1} heading`}
                        className="flex-1 rounded-md bg-vault-bg border border-vault-border px-3 py-2 text-sm text-white outline-none focus:border-vault-accent transition-colors"
                    />
                    {sections.length > 1 && (
                        <button type="button" onClick={() => removeSection(i)} className="text-vault-faint hover:text-vault-danger">
                        <Trash2 size={16} />
                        </button>
                    )}
                    </div>
                    <textarea
                    value={s.text}
                    onChange={(e) => updateSection(i, 'text', e.target.value)}
                    rows={2}
                    placeholder="Description"
                    className="w-full rounded-md bg-vault-bg border border-vault-border px-3 py-2 text-sm text-white outline-none focus:border-vault-accent transition-colors resize-none"
                    />
                    <input
                    value={s.code}
                    onChange={(e) => updateSection(i, 'code', e.target.value)}
                    placeholder="Command (optional)"
                    className="w-full rounded-md bg-vault-bg border border-vault-border px-3 py-2 text-sm font-mono text-emerald-400 outline-none focus:border-vault-accent transition-colors"
                    />
                </div>
                ))}
            </div>
            </div>

            {error && <p className="text-sm text-vault-danger">{error}</p>}

            <button
            type="submit"
            disabled={loading || !user}
            className="rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-60"
            >
            {loading ? 'Publishing…' : 'Publish document'}
            </button>
        </form>
        </div>
    );
}
