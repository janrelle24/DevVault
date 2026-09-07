//import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
//import { api } from '../lib/api';
//import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Bits';

export default function Recent() {
    

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Recently Viewed' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Recently Viewed</h1>

        
            <p className="text-sm text-vault-muted">Log in to keep track of the documents you've viewed.</p>
        
            <p className="text-sm text-vault-muted">Loading…</p>
        
            <div className="flex flex-col items-center text-center py-16 text-vault-muted">
            <Clock size={32} className="mb-3 text-vault-faint" />
            <p className="text-sm">Documents you open will show up here.</p>
            </div>
        
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
