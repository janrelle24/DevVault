import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ lang = 'bash', value }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        } catch {
        // clipboard may be unavailable; fail silently
        }
    }

    return (
        <div className="rounded-lg border border-vault-border bg-vault-elevated overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-vault-border">
            <span className="text-xs font-mono text-vault-faint">{lang}</span>
            <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
            >
            {copied ? <Check size={13} className="text-vault-success" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
        <pre className="px-4 py-3 overflow-x-auto">
            <code className="font-mono text-sm text-emerald-400">{value}</code>
        </pre>
        </div>
    );
}
