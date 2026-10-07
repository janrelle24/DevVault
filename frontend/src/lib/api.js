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
    getCategories: () => request('/categories', { auth: false }),
    getCategory: (slug) => request(`/categories/${slug}`, { auth: false }),

    // documents
    getDocuments: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/documents${qs ? `?${qs}` : ''}`, { auth: false });
    },
    getDocument: (slug) => request(`/documents/${slug}`),
    createDocument: (payload) => request('/documents', { method: 'POST', body: payload }),
    updateDocument: (slug, payload) => request(`/documents/${slug}`, { method: 'PATCH', body: payload }),
    sendFeedback: (slug, helpful) => request(`/documents/${slug}/feedback`, { method: 'POST', body: { helpful }, auth: false }),

    // bookmarks
    getBookmarks: () => request('/bookmarks'),
    addBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'POST' }),
    removeBookmark: (slug) => request(`/bookmarks/${slug}`, { method: 'DELETE' }),

    // misc
    getTags: () => request('/tags', { auth: false }),
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
