import { NavLink } from 'react-router-dom';
//import { useEffect, useState } from 'react';
import { Home, Grid2x2, Tag, Bookmark, Clock, Crown} from 'lucide-react';
//import { api } from '../lib/api';
//import { useAuth } from '../context/AuthContext';
const navItems = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/categories', icon: Grid2x2, label: 'Categories' },
    { to: '/tags', icon: Tag, label: 'Tags' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { to: '/recent', icon: Clock, label: 'Recently Viewed' }
];

export default function Sidebar(open, onNavigate){
    return (
        <aside
            className={`fixed lg:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-vault-panel border-r border-vault-border
            flex flex-col transform transition-transform duration-200 lg:transform-none
            ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >

            {/* Logo */}
            <div className="h-[65px] flex items-center gap-2.5 px-5 border-b border-vault-border shrink-0">
                <div className="h-8 w-8 rounded-lg bg-vault-accent flex items-center justify-center text-white font-bold text-sm">
                DV
                </div>
                <span className="text-white font-bold text-lg tracking-tight">DevVault</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">


                <nav className="space-y-1 mb-6">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => onNavigate?.()}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-vault-accent-soft text-vault-accent border border-vault-accent/30'
                                    : 'text-vault-muted hover:text-white hover:bg-white/5'
                                }`
                            }
                            >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <p className="px-3 text-xs font-semibold tracking-wide text-vault-faint mb-2">Categories</p>
                <nav className="space-y-0.5">
                    
                        <NavLink
                            
                        
                            onClick={() => onNavigate?.()}
                            className={({ isActive }) =>
                                `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive ? 'text-vault-accent bg-vault-accent-soft' : 'text-vault-muted hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                        <span className="flex items-center gap-2.5 truncate">
                            <span className="text-base leading-none"></span>
                            <span className="truncate"></span>
                        </span>
                        
                            <span className="text-xs text-vault-faint tabular-nums"></span>
                        
                        </NavLink>
                    
                </nav>
            </div>
            
                <div className="m-3 rounded-xl border border-vault-border bg-vault-elevated p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1.5">
                        <Crown size={15} className="text-amber-400" /> Pro Tip
                    </div>
                    <p className="text-xs text-vault-muted leading-relaxed mb-3">
                        Create an account to bookmark your favorite docs and track your learning progress.
                    </p>
                    <NavLink
                        to="/signup"
                        onClick={() => onNavigate?.()}
                        className="block text-center rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold py-2 transition-colors"
                    >
                        Create Account
                    </NavLink>
                </div>
            
        </aside>
    );
}