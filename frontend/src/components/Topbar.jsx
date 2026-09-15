import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, User } from 'lucide-react';
//import { useAuth } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            boxRef.current?.querySelector('input')?.focus();
        }
        if (e.key === 'Escape') setShowResults(false);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    /*
    useEffect(() => {
        if (!query.trim()) {
        setResults([]);
        return;
        }
        const timeout = setTimeout(() => {
        api.getDocuments({ search: query }).then(({ documents }) => setResults(documents)).catch(() => {});
        }, 200);
        return () => clearTimeout(timeout);
    }, [query]);*/
    useEffect(() =>{
        const timeout = setTimeout(() =>{
            if(!query.trim()){
                setResults([]);
                return;
            }
            api.getDocuments({ search: query })
                .then(({ documents}) =>{
                    setResults(documents);
                })
                .catch(() => {});
        }, 200);
        return () => clearTimeout(timeout);
    }, [query]);

    function goToDoc(slug) {
        setShowResults(false);
        setQuery('');
        navigate(`/docs/${slug}`);
    }

    return (
        <header className="h-[65px] shrink-0 border-b border-vault-border bg-vault-bg/95 backdrop-blur flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30">
        <button className="lg:hidden text-vault-muted hover:text-white" onClick={onMenuClick}>
            <Menu size={22} />
        </button>

        <div ref={boxRef} className="relative flex-1 max-w-xl">
            <div className="flex items-center gap-2.5 bg-vault-elevated border border-vault-border rounded-lg px-3.5 py-2.5">
            <Search size={16} className="text-vault-faint shrink-0" />
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                placeholder="Search documentation..."
                className="bg-transparent flex-1 text-sm text-white placeholder:text-vault-faint outline-none min-w-0"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-vault-faint bg-white/5 border border-vault-border rounded px-1.5 py-0.5">
                Ctrl K
            </kbd>
            </div>

            {showResults && results.length > 0 && (
            <div className="absolute mt-2 w-full bg-vault-elevated border border-vault-border rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                {results.map((doc) => (
                <button
                    key={doc.id}
                    onMouseDown={() => goToDoc(doc.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 border-b border-vault-border last:border-0"
                >
                    <span className="text-base">{doc.icon}</span>
                    <span className="min-w-0">
                    <span className="block text-sm text-white font-medium truncate">{doc.title}</span>
                    <span className="block text-xs text-vault-faint truncate">{doc.category_name}</span>
                    </span>
                </button>
                ))}
            </div>
            )}
        </div>

        <div className="flex-1" />

        {user ? (
            <div className="relative">
            <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex items-center gap-2 rounded-lg border border-vault-border bg-vault-elevated px-3 py-2 text-sm text-white hover:border-vault-accent/50 transition-colors"
            >
                <div className="h-6 w-6 rounded-full bg-vault-accent flex items-center justify-center text-xs font-semibold">
                {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-vault-elevated border border-vault-border rounded-lg shadow-2xl overflow-hidden">
                <div className="px-3.5 py-2.5 text-xs text-vault-faint border-b border-vault-border truncate">{user.email}</div>
                <button
                    onMouseDown={logout}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-vault-danger hover:bg-white/5 transition-colors"
                >
                    <LogOut size={14} /> Log out
                </button>
                </div>
            )}
            </div>
        ) : (
            <div className="flex items-center gap-2 shrink-0">
            <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
                Login
            </button>
            <button
                onClick={() => navigate('/signup')}
                className="rounded-lg border border-vault-border hover:border-vault-accent/50 text-white text-sm font-semibold px-4 py-2 transition-colors flex items-center gap-1.5"
            >
                <User size={14} /> Sign Up
            </button>
            </div>
        )}
        </header>
    );
}
