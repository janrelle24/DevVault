//const BASE_URL = '/api';
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;

function getToken() {
    return localStorage.getItem('devvault_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
}

export const api = {
  // auth
    signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
    me: () => request('/auth/me'),

    // categories
    getCategories: () => request('/categories', { auth: false }),
    getCategory: (slug) => request(`/categories/${slug}`, { auth: false }),

    // documents
    getDocuments: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/documents${qs ? `?${qs}` : ''}`, { auth: false });
    },
    getDocument: (slug) => request(`/documents/${slug}`, { auth: false }),
    createDocument: (payload) => request('/documents', { method: 'POST', body: payload }),
    updateDocument: (slug, payload) => request(`/documents/${slug}`, { method: 'PATCH', body: payload }),
    sendFeedback: (slug, helpful) => request(`/documents/${slug}/feedback`, { method: 'POST', body: { helpful }, auth: false }),

    // bookmarks
    getBookmarks: () => request('/bookmarks'),
    addBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'POST' }),
    removeBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'DELETE' }),

    // misc
    getTags: () => request('/tags', { auth: false }),
    getRecentlyViewed: () => request('/recently-viewed'),

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
