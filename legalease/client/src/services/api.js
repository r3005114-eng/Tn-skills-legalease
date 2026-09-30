const BASE_URL = '/api';

function getHeaders(isFormData = false) {
  const headers = {};
  const token = localStorage.getItem('legalease_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const customKey = localStorage.getItem('legalease_gemini_api_key');
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const config = {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      let errData = {};
      try {
        errData = await res.json();
      } catch (e) {
        errData = { error: `Server returned status ${res.status}` };
      }
      throw new Error(errData.error || 'A legal service error occurred. Please try again.');
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  demoLogin: () => request('/auth/demo', {
    method: 'POST'
  }),
  getMe: () => request('/auth/me'),

  // AI Chat
  sendChatMessage: (payload) => request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  sendChatFeedback: (payload) => request('/chat/feedback', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Documents & Analyzer
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/documents/upload', {
      method: 'POST',
      body: formData
    });
  },
  analyzeDocument: (payload) => request('/documents/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getDocuments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/documents?${query}`);
  },
  getDocumentById: (id) => request(`/documents/${id}`),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  exportDocumentReport: async (id, format = 'pdf') => {
    const res = await fetch(`${BASE_URL}/documents/${id}/export?format=${format}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to generate export file.');
    return await res.blob();
  },

  // Draft Studio
  generateDraft: (payload) => request('/drafts/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  saveDraft: (id, payload) => request(`/drafts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  getDrafts: () => request('/drafts'),
  getDraftById: (id) => request(`/drafts/${id}`),
  deleteDraft: (id) => request(`/drafts/${id}`, { method: 'DELETE' }),
  exportDraftFile: async (format, title, content) => {
    const res = await fetch(`${BASE_URL}/drafts/export/${format}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content })
    });
    if (!res.ok) throw new Error(`Export to ${format.toUpperCase()} failed.`);
    return await res.blob();
  },

  // Chat History
  getHistory: () => request('/history'),
  getConversationById: (id) => request(`/history/${id}`),
  renameConversation: (id, title) => request(`/history/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title })
  }),
  deleteConversation: (id) => request(`/history/${id}`, { method: 'DELETE' }),

  // Legal Library
  getLibraryArticles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/library?${query}`);
  },
  getArticleById: (id) => request(`/library/${id}`)
};
