// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  signup: async (username, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// USER MANAGEMENT API (Admin)
// ============================================
export const userAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId, newRole) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole }),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// REGEX TEMPLATE API (Maker/Checker)
// ============================================
export const regexAPI = {
  // Get all templates
  getAllTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get templates by status
  getTemplatesByStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/templates?status=${status}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get pending templates (for checker)
  getPendingTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/templates/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Save draft template
  saveDraft: async (templateData) => {
    const response = await fetch(`${API_BASE_URL}/templates/draft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
    return handleResponse(response);
  },

  // Update existing template
  updateTemplate: async (templateId, templateData) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
    return handleResponse(response);
  },

  // Submit template for approval
  submitForApproval: async (templateId) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Approve template (checker only)
  approveTemplate: async (templateId) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Reject template (checker only)
  rejectTemplate: async (templateId, reason) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// TRANSACTION API (User)
// ============================================
export const transactionAPI = {
  // Parse SMS message
  parseSMS: async (smsText, templateId = null) => {
    const response = await fetch(`${API_BASE_URL}/transactions/parse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ smsText, templateId }),
    });
    return handleResponse(response);
  },

  // Save transaction
  saveTransaction: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData),
    });
    return handleResponse(response);
  },

  // Get all transactions for current user
  getTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get transactions by type (DEBIT/CREDIT)
  getTransactionsByType: async (type) => {
    const response = await fetch(`${API_BASE_URL}/transactions?type=${type}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update transaction
  updateTransaction: async (transactionId, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData),
    });
    return handleResponse(response);
  },

  // Delete transaction
  deleteTransaction: async (transactionId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// EXPORT ALL
// ============================================
export default {
  auth: authAPI,
  users: userAPI,
  regex: regexAPI,
  transactions: transactionAPI,
};
