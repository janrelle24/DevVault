import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                Welcome back
            </h1>
            <p className="text-vault-muted mb-8">
                Everything your team needs to build, ship, and maintain the stack - in one place.
            </p>

            <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">BROWSE BY CATEGORY</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
                <Link
                    className="rounded-xl border border-vault-border bg-vault-elevated p-4 hover:border-vault-accent/40 transition-colors"
                >
                    <span className="text-2xl block mb-2"></span>
                    <span className="block text-sm font-semibold text-white truncate"></span>
                    <span className="block text-xs text-vault-faint mt-0.5"> docs</span>
                </Link>
            </div>
            <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">RECENTLY UPDATED</p>
        
                <p className="text-sm text-vault-muted">Loading documents…</p>
            
                <div className="grid sm:grid-cols-2 gap-3">
            
                    <Link
                    
                    className="rounded-xl border border-vault-border bg-vault-elevated p-4 hover:border-vault-accent/40 transition-colors"
                    >
                    <div className="flex items-start gap-3">
                        <span className="text-xl"></span>
                        <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate"></p>
                        <p className="text-xs text-vault-faint mt-1 line-clamp-2"></p>
                        </div>
                    </div>
                    </Link>
                
                </div>
        </div>
    );
}