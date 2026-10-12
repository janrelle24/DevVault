const DB_NAME = 'devvault-offline';
const DB_VERSION = 2;

export const QUEUE_CHANGED_EVENT = 'devvault:queue-changed';
export const BOOKMARKS_SYNCED_EVENT = 'devvault:bookmarks-synced';

const notifyQueueChanged = () => window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('docs')) db.createObjectStore('docs', { keyPath: 'slug' });
            if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
            if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { keyPath: 'slug' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function wrap(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function txDone(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

// ── Saved documents ──────────────────────────────────────────

export async function saveBundle({ documents, categories }) {
    const db = await openDb();
    const tx = db.transaction(['docs', 'meta'], 'readwrite');
    const docs = tx.objectStore('docs');
    const meta = tx.objectStore('meta');

    docs.clear(); // replace the old copy so deleted docs disappear
    documents.forEach((d) => docs.put(d));
    meta.put(categories, 'categories');
    meta.put({ savedAt: Date.now(), count: documents.length }, 'info');

    await txDone(tx);

    // Ask the browser not to evict our data under storage pressure.
    navigator.storage?.persist?.().catch(() => {});
}

export async function getSavedInfo() {
    const db = await openDb();
    return (await wrap(db.transaction('meta').objectStore('meta').get('info'))) || null;
}

export async function getSavedDoc(slug) {
    const db = await openDb();
    return (await wrap(db.transaction('docs').objectStore('docs').get(slug))) || null;
}

export async function getSavedCategories() {
    const db = await openDb();
    const cats = await wrap(db.transaction('meta').objectStore('meta').get('categories'));
    return cats || [];
}

async function getAllSavedDocs() {
    const db = await openDb();
    return wrap(db.transaction('docs').objectStore('docs').getAll());
}

// Same filters as GET /api/documents, plus section text matching.
export async function searchSavedDocs({ search, category, tag } = {}) {
    let docs = await getAllSavedDocs();

    if (category) docs = docs.filter((d) => d.category_slug === category);
    if (tag) docs = docs.filter((d) => d.tags?.some((t) => t.slug === tag));

    if (search?.trim()) {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean);
        docs = docs
            .map((d) => {
                const title = d.title.toLowerCase();
                const desc = (d.description || '').toLowerCase();
                const body = (d.content || [])
                    .map((b) => `${b.heading || ''} ${b.text || ''}`)
                    .join(' ')
                    .toLowerCase();

                let score = 0;
                for (const w of words) {
                    if (title.includes(w)) score += 3;
                    else if (desc.includes(w)) score += 2;
                    else if (body.includes(w)) score += 1;
                    else return null; // every word must match somewhere
                }
                return { d, score };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score)
            .map((x) => x.d);
    } else {
        docs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    // Strip the heavy content field for list views.
    return docs.slice(0, 50).map((rest) => rest);
}

export async function getSavedCategory(slug) {
    const categories = await getSavedCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return null;
    const documents = await searchSavedDocs({ category: slug });
    return { category, documents };
}

export async function getSavedTags() {
    const docs = await getAllSavedDocs();
    const map = new Map();
    docs.forEach((d) => d.tags?.forEach((t) => map.set(t.slug, t)));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ── Local mirror of the user's bookmarked slugs ──────────────

async function updateBookmarkSet(fn) {
    const db = await openDb();
    const tx = db.transaction('meta', 'readwrite');
    const store = tx.objectStore('meta');
    const req = store.get('bookmarks');
    req.onsuccess = () => {
        const set = new Set(req.result || []);
        fn(set);
        store.put([...set], 'bookmarks');
    };
    await txDone(tx);
}

export async function getLocalBookmarkSlugs() {
    const db = await openDb();
    return (await wrap(db.transaction('meta').objectStore('meta').get('bookmarks'))) || [];
}

export const setLocalBookmark = (slug, on) =>
    updateBookmarkSet((set) => (on ? set.add(slug) : set.delete(slug)));

export const replaceLocalBookmarks = (slugs) =>
    updateBookmarkSet((set) => {
        set.clear();
        slugs.forEach((s) => set.add(s));
    });

export async function getSavedDocsBySlugs(slugs) {
    const wanted = new Set(slugs);
    const docs = await getAllSavedDocs();
    return docs
        .filter((d) => wanted.has(d.slug))
        .map((rest) => rest);
}

// ── Pending bookmark changes (one entry per slug, latest wins) ──

export async function queueBookmark({ slug, action, userId }) {
    const db = await openDb();
    const tx = db.transaction('queue', 'readwrite');
    tx.objectStore('queue').put({ slug, action, userId, queuedAt: Date.now() });
    await txDone(tx);
    notifyQueueChanged();
}

export async function getQueue() {
    const db = await openDb();
    return wrap(db.transaction('queue').objectStore('queue').getAll());
}

// With queuedAt: only delete if the entry hasn't been changed meanwhile.
// Without it: delete unconditionally.
export async function removeFromQueue(slug, queuedAt) {
    const db = await openDb();
    const tx = db.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    const req = store.get(slug);
    req.onsuccess = () => {
        if (req.result && (queuedAt === undefined || req.result.queuedAt === queuedAt)) {
            store.delete(slug);
        }
    };
    await txDone(tx);
    notifyQueueChanged();
}

// Called on logout so the next person on this computer sees none of it.
export async function clearOfflineUserData() {
    const db = await openDb();
    const tx = db.transaction(['queue', 'meta'], 'readwrite');
    tx.objectStore('queue').clear();
    tx.objectStore('meta').delete('bookmarks');
    await txDone(tx);
    notifyQueueChanged();
}
