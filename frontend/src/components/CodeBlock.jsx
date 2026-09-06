//import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ lang = 'bash', value }) {
    

    return (
        <div className="rounded-lg border border-vault-border bg-vault-elevated overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-vault-border">
            <span className="text-xs font-mono text-vault-faint">{lang}</span>
            <button
        
            className="flex items-center gap-1.5 text-xs text-vault-muted hover:text-white transition-colors"
            >
            <Check size={13} className="text-vault-success" /> : <Copy  />
            
            </button>
        </div>
        <pre className="px-4 py-3 overflow-x-auto">
            <code className="font-mono text-sm text-emerald-400">{value}</code>
        </pre>
        </div>
    );
}
