import { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { getSavedInfo } from '../lib/offlineStore';
import { refreshOfflineCopy, OFFLINE_SAVED_EVENT } from '../lib/offlineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import ButtonSpinner from './ButtonSpinner';

export default function OfflineSaveButton() {
    const online = useOnlineStatus();
    const [info, setInfo] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = () => getSavedInfo().then(setInfo).catch(() => {});
        load();
        window.addEventListener(OFFLINE_SAVED_EVENT, load);
        return () => window.removeEventListener(OFFLINE_SAVED_EVENT, load);
    }, []);

    async function handleSave() {
        setSaving(true);
        setError('');
        try {
            await refreshOfflineCopy(); // fires OFFLINE_SAVED_EVENT, which reloads `info`
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const title = error
        ? error
        : info
            ? `${info.count} docs saved · ${new Date(info.savedAt).toLocaleString()}. Click to refresh.`
            : 'Save all docs for offline use';

    return (
        <button
            onClick={handleSave}
            disabled={saving || !online}
            title={title}
            aria-label={title}
            className="shrink-0 h-9 px-3 flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-elevated text-xs font-medium text-vault-muted hover:text-vault-text hover:border-vault-accent/40 transition-colors disabled:opacity-50"
        >
            {saving ? (
                <ButtonSpinner size={14} />
            ) : info ? (
                <CheckCircle2 size={14} className="text-vault-success" />
            ) : (
                <Download size={14} />
            )}
            <span className="hidden md:inline">{info ? 'Saved offline' : 'Save offline'}</span>
        </button>
    );
}
