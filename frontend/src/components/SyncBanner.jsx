import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePendingSyncCount } from '../hooks/usePendingSyncCount';
import { flushBookmarkQueue } from '../lib/api';
import { BOOKMARKS_SYNCED_EVENT } from '../lib/offlineStore';
import ButtonSpinner from './ButtonSpinner';

const plural = (n) => `${n} change${n === 1 ? '' : 's'}`;

export default function SyncBanner() {
    const { user } = useAuth();
    const online = useOnlineStatus();
    const pending = usePendingSyncCount();
    const [syncedCount, setSyncedCount] = useState(0);
    const [retrying, setRetrying] = useState(false);

    // Show "Synced" briefly after a successful flush.
    useEffect(() => {
        let timer;
        const onSynced = (e) => {
            setSyncedCount(e.detail);
            clearTimeout(timer);
            timer = setTimeout(() => setSyncedCount(0), 4000);
        };
        window.addEventListener(BOOKMARKS_SYNCED_EVENT, onSynced);
        return () => {
            window.removeEventListener(BOOKMARKS_SYNCED_EVENT, onSynced);
            clearTimeout(timer);
        };
    }, []);

    async function retry() {
        if (!user) return;
        setRetrying(true);
        try {
            await flushBookmarkQueue(user.id);
        } catch {
            // stays queued; the banner keeps showing the count
        } finally {
            setRetrying(false);
        }
    }

    const base = 'border-b text-xs text-center py-1.5 px-3 flex items-center justify-center gap-2';
    const amber = `${base} bg-amber-500/10 border-amber-500/30 text-amber-500`;

    if (!online) {
        return (
            <div role="status" aria-live="polite" className={amber}>
                <CloudOff size={13} />
                <span>
                    You're offline. Showing saved documents.
                    {pending > 0 && ` ${plural(pending)} will sync when you're back online.`}
                </span>
            </div>
        );
    }

    if (pending > 0) {
        return (
            <div role="status" aria-live="polite" className={amber}>
                {retrying ? <ButtonSpinner size={13} /> : <RefreshCw size={13} />}
                <span>{retrying ? 'Syncing…' : `${plural(pending)} waiting to sync.`}</span>
                {!retrying && (
                    <button onClick={retry} className="font-semibold underline underline-offset-2 hover:no-underline">
                        Retry now
                    </button>
                )}
            </div>
        );
    }

    if (syncedCount > 0) {
        return (
            <div
                role="status"
                aria-live="polite"
                className={`${base} bg-vault-success-bg border-vault-success/30 text-vault-success`}
            >
                <CheckCircle2 size={13} />
                <span>Synced {plural(syncedCount)}.</span>
            </div>
        );
    }

    return null;
}
