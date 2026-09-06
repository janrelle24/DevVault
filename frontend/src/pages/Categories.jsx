//import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
//import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Bits';

export function CategoriesList(){
    //const [categories, setCategories] = useState([]);

    

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Categories</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <Link
                    
                    className="rounded-xl border border-vault-border bg-vault-elevated p-4 hover:border-vault-accent/40 transition-colors"
                >
                    <span className="text-2xl block mb-2"></span>
                    <span className="block text-sm font-semibold text-white truncate"></span>
                    <span className="block text-xs text-vault-faint mt-0.5">docs</span>
                </Link>
                
            </div>
        </div>
    );
}

export function CategoryDetail(){
    

    

    

    

    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }, ]} />
        <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl"></span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight"></h1>
        </div>

        
            <p className="text-sm text-vault-muted">No documents in this category yet.</p>
        
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
