import * as offline from './offlineStore';

const API_ROOT = (import.meta.env.VITE_API_URL ?? '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');
const BASE_URL = `${API_ROOT}/api`;

function getToken() {
    return localStorage.getItem('devvault_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {};
    const token = getToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.error || 'Something went wrong. Please try again.');
        err.code = data.code;
        err.status = res.status;
        throw err;
    }
    return data;
}
// Try the network; if we're offline, use the saved copy instead.
async function withOfflineFallback(networkCall, fallbackCall){
    try {
        return await networkCall();
    }catch(err){
        if(!err.offline) throw err;
        const saved = await fallbackCall();
        if(saved == null) throw err;
        return saved;
    }
}
// Bookmark toggle that queues the change when offline.
async function setBookmark(slug, shouldBookmark, useId){
    try{
        await request(`/bookmarks/${slug}`, { method: shouldBookmark ? 'POST' : 'DELETE '});
        await offline.removeFromQueue(slug).catch(() => {});
        await offline.setLocalBookmark(slug, shouldBookmark).catch(() => {});
        return { queued: false };
    }catch(err){
        if(!err.offline) throw err;
        await offline.queueBookmak({
            slug,
            action: shouldBookmark ? 'add' : 'remove',
            useId
        });
        await offline.setLocalBookmark(slug, shouldBookmark);
        return { queued: true };
    }
}
let flushing = false;

// Replays bookmark changes made while offline. Returns how many were synced.
export async function flushBookmarkQueue(useId){
    if(flushing) return 0;
    flushing = true;
    let synced = 0;
    try {
        for (const item of await offline.getQueue()){
            if(item.useId !== useId) continue;
            try{
                await request(`/bookmarks/${item.slug}`, {
                    method: item.action === 'add' ? 'POST' : 'DELETE'
                });
            }catch(err){
                // Network down, logged out, rate limited, or server error: keep and retry later.
                if (err.offline || err.status === 401 || err.status === 429 || err.status >= 500) break;
            }
            await offline.removeFromQueue(item.slug, item.queuedAt);
            synced++;
        }
    }finally{
        flushing = false;
    }
    if(synced > 0) {
        window.dispatchEvent(
            new CustomEvent(offline.BOOKMARKS_SYNCED_EVENT, { detail: synced })
        );
        return synced;
    }
}

export const api = {
  // auth
    signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
    verifyEmail: (payload) => request('/auth/verify-email', { method: 'POST', body: payload, auth: false }),
    resendOtp: (payload) => request('/auth/resend-otp', { method: 'POST', body: payload, auth: false }),
    me: () => request('/auth/me'),

    forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: payload, auth: false}),
    resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload, auth: false }),

    // categories
    /*getCategories: () => request('/categories', { auth: false }),
    getCategory: (slug) => request(`/categories/${slug}`, { auth: false }),*/
    getCategories: () =>
        withOfflineFallback(
            () => request('/categories', { auth: false}),
            async () => {
                const categories = await offline.getSavedCategories();
                return categories.length ? { categories } : null;
            }
        ),
    getCategory: (slug) =>
        withOfflineFallback(
            () => request(`/categories/${slug}`, { auth: false }),
            () => offline.getSavedCategory(slug)
        ),

    // documents
    /*
    getDocuments: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/documents${qs ? `?${qs}` : ''}`, { auth: false });
    },
    getDocument: (slug) => request(`/documents/${slug}`),*/
    getDocuments: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return withOfflineFallback(
            () => request(`/documents${qs ? `?${qs}` : ''}`, { auth: false }),
            async () => ({ documents: await offline.searchSavedDocs(params) })
        );
    },
    getDocument: (slug) => 
        withOfflineFallback(
            async () => {
                const data = await request(`/documents/${slug}`);
                offline.setLocalBookmark(slug, !!data.document.isBookmarked).catch(() => {});
                return data;
            },
            async () => {
                const doc = await offline.getSasveDoc(slug);
                if(!doc) return null;
                const slugs = await offline.getLocalBookmarkSlugs();
                return { document: { ...doc, isBookmarked: slugs.includes(slug) } };
            }
        ),
    createDocument: (payload) => request('/documents', { method: 'POST', body: payload }),
    updateDocument: (slug, payload) => request(`/documents/${slug}`, { method: 'PATCH', body: payload }),
    sendFeedback: (slug, helpful) => request(`/documents/${slug}/feedback`, { method: 'POST', body: { helpful }, auth: false }),

    // used by the "Save for offline" button
    getOfflineBundle: () => request('/documents/offline/bundle', { auth: false }),

    // bookmarks
    //getBookmarks: () => request('/bookmarks'),
    addBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'POST' }),
    removeBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'DELETE' }),

    getBookmarks: () =>
        withOfflineFallback(
            async () => {
                const data = await request('/bookmarks');
                offline.replaceLocalBookmarks(data.bookmarks.map((b) => b.slug)).catch(() => {});
                return data;
            },
            async () => {
                const slugs = await offline.getLocalBookmarkSlugs();
                return { bookmarks: await offline.getSavedDocsBySlugs(slugs) };
            }
        ),
    setBookmark,

    // misc
    //getTags: () => request('/tags', { auth: false }),
    getTags: () =>
        withOfflineFallback(
            () => request('/tags', { auth: false }),
            async () => {
                const tags = await offline.getSavedTags();
                return tags.length ? { tags } : null;
            }
        ),
    getRecentlyViewed: () => request('/recent'),

    // admin
    getAdminStats: () => request('/admin/stats'),
    getAdminDocuments: () => request('/admin/documents'),
    getAdminUsers: () => request('/admin/users'),
    setUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
    deleteDocument: (slug) => request(`/documents/${slug}`, { method: 'DELETE' }),
    createCategory: (payload) => request('/categories', { method: 'POST', body: payload }),
    deleteCategory: (slug) => request(`/categories/${slug}`, { method: 'DELETE' })
};

export { getToken };
