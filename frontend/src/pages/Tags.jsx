//import { useEffect, useState } from 'react';
//import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
//import { api } from '../lib/api';
import { Breadcrumbs, TagBadge } from '../components/Bits';

export default function Tags() {
    

    

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Tags</h1>

        <div className="flex flex-wrap gap-2 mb-8">
            <button
            
            className={`text-xs font-medium rounded-md border px-2.5 py-1 transition-colors `}
            >
            All
            </button>
            
            <button>
                <TagBadge />
            </button>
            
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
