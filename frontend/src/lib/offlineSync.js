import { api } from './api';
import { saveBundle, getSavedInfo } from './offlineStore';

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
export const OFFLINE_SAVED_EVENT = 'devvault:offline-saved';

let inFlight = null;

export function refreshOfflineCopy() {
    inFlight ??= (async () =>{
        const [{ documents }, { categories }] = await Promise.all([
            api.getOfflineBundle(),
            api.getCategories()
        ]);
        await saveBundle({ documents, categories });
        window.dispatchEvent(new Event(OFFLINE_SAVED_EVENT));
    })().finally(() =>{
        inFlight = null;
    });
    return inFlight;
}

// Only refreshes if the user has saved once before (opt-in) and the copy is old.
export async function refreshOfflineCopyIfStale() {
    const info = await getSavedInfo();
    if (!info) return false;
    if (Date.now() - info.savedAt < STALE_AFTER_MS) return false;
    await refreshOfflineCopy();
    return true;
}