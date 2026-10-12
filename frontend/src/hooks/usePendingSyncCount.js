import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getQueue, QUEUE_CHANGED_EVENT } from '../lib/offlineStore';

// Number of queued changes belonging to the logged-in user.
export function usePendingSyncCount() {
    const { user } = useAuth();
    const userId = user?.id;
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;

        const load = async () => {
            const items = await getQueue().catch(() => []);
            if (!cancelled) setCount(items.filter((i) => i.userId === userId).length);
        };

        load();
        window.addEventListener(QUEUE_CHANGED_EVENT, load);
        return () => {
            cancelled = true;
            window.removeEventListener(QUEUE_CHANGED_EVENT, load);
        };
    }, [userId]);

    return userId ? count : 0;
}
