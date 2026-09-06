//import { useEffect, useState } from 'react';
import { LifeBuoy, ThumbsUp, ThumbsDown } from 'lucide-react';
//import { api } from '../lib/api';

export default function RightRail() {
    

    return (
        <aside className="hidden xl:block w-64 shrink-0 px-6 py-8 space-y-6">
        
            <div>
            <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">ON THIS PAGE</p>
            <nav className="space-y-2 border-l border-vault-border">
                
                <a
                    
                    className= {`block pl-3 -ml-px border-l-2 text-sm transition-colors`} 
                    
                >
                    
                </a>
                
            </nav>
            </div>
    

        <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1.5">
            <LifeBuoy size={16} className="text-vault-accent" /> Having Issues?
            </div>
            <p className="text-xs text-vault-muted leading-relaxed mb-3">
            Check out the common problems section or ask in our community.
            </p>
            <button className="w-full rounded-lg border border-vault-accent/40 text-vault-accent text-sm font-semibold py-2 hover:bg-vault-accent-soft transition-colors">
            View Troubleshooting
            </button>
        </div>

        <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
            <p className="text-sm font-semibold text-white mb-0.5">Was this helpful?</p>
            <p className="text-xs text-vault-muted mb-3">Help us improve this documentation.</p>
            <div className="flex gap-2">
            <button
                
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-sm font-medium transition-colors
                `}
            >
                <ThumbsUp size={14} /> Yes
            </button>
            <button
                
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-sm font-medium transition-colors`}
                
            >
                <ThumbsDown size={14} /> No
            </button>
            </div>
        </div>
        </aside>
    );
}
