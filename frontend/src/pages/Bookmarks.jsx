import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { api } from '../lib/api';
//import { useAuth } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumbs } from '../components/Bits';

export default function Bookmarks() {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    //const [loading, setLoading] = useState(true);
    const [loading, setLoading] = useState(() => !!user);
    /*
    useEffect(() => {
        if (!user) {
        setLoading(false);
        return;
        }
        api.getBookmarks().then(({ bookmarks }) => setBookmarks(bookmarks)).finally(() => setLoading(false));
    }, [user]);*/
    useEffect(()=>{
        if (!user) {
            return; 
        }
        let cancelled = false;
        api.getBookmarks()
            .then(({ bookmarks }) =>{
                if(!cancelled){
                    setBookmarks(bookmarks);
                }
            })
            .finally(() =>{
                if(!cancelled){
                    setLoading(false);
                }
            });
        return () =>{
            cancelled = true;
        };
    }, [user]);

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bookmarks' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Bookmarks</h1>

        {!user ? (
            <p className="text-sm text-vault-muted">Log in to save and view your bookmarked documents.</p>
        ) : loading ? (
            <p className="text-sm text-vault-muted">Loading…</p>
        ) : bookmarks.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 text-vault-muted">
            <Bookmark size={32} className="mb-3 text-vault-faint" />
            <p className="text-sm">No bookmarks yet. Tap the bookmark icon on any doc to save it here.</p>
            </div>
        ) : (
            <div className="grid sm:grid-cols-2 gap-3">
            {bookmarks.map((doc) => (
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
