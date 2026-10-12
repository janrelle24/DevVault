import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useOnlineStatus } from './useOnlineStatus';
import { flushBookmarkQueue } from '../lib/api';
import { refreshOfflineCopyIfStale } from '../lib/offlineSync';

// Runs on app start, on login, and whenever the connection comes back.
export function useOfflineSync(){
    const { user } = useAuth();
    const online = useOnlineStatus();

    useEffect(() =>{
        if(!online) return;
        let cancelled = false;

        (async () =>{
            if(user) await flushBookmarkQueue(user.id).catch(() => {});
            if(cancelled) return;
            await refreshOfflineCopyIfStale().catch(() => {});
        })();

        return () => {
            cancelled = true;

        };
    }, [online, user]);
}