import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8080';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Checker Store - Isolated store for all checker-related functionality
 * Handles: fetching pending templates, approving, rejecting, viewing all templates
 */
export const useCheckerStore = create((set, get) => ({
  // State
  pendingTemplates: [],
  allTemplates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,
  statusFilter: 'ALL', // ALL, PENDING, APPROVED, REJECTED, FAILED, DRAFT

  // ============================================
  // FETCH OPERATIONS
  // ============================================

  /**
   * Fetch all pending templates for approval
   * Endpoint: GET /checker/getPendings
   */
  fetchPendingTemplates: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/checker/getPendings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch pending templates' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const pendingTemplates = await response.json();
      
      // Transform backend data to frontend format
      const transformed = pendingTemplates.map(p => ({
        id: p.patternId,
        pattern: p.regexPattern,
        sampleMessage: p.sampleEx,
        status: p.status?.toUpperCase() || 'PENDING',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      
      set({ pendingTemplates: transformed, isLoading: false });
      return transformed;
    } catch (error) {
      console.error('Fetch pending templates error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Fetch all templates (all statuses)
   * Endpoint: GET /checker/getAllPatterns
   */
  fetchAllTemplates: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/checker/getAllPatterns`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch templates' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const templates = await response.json();
      
      // Transform backend data to frontend format
      const transformed = templates.map(p => ({
        id: p.patternId,
        pattern: p.regexPattern,
        sampleMessage: p.sampleEx,
        status: p.status?.toUpperCase() || 'UNKNOWN',
      }));
      
      set({ allTemplates: transformed, isLoading: false });
      return transformed;
    } catch (error) {
      console.error('Fetch all templates error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ============================================
  // APPROVAL OPERATIONS
  // ============================================

  /**
   * Approve a pending template
   * Endpoint: POST /checker/postPatternAndSample
   */
  approveTemplate: async (templateId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/checker/postPatternAndSample`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patternId: templateId,
          action: 'APPROVED',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to approve template' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Remove from pending list and update all templates list
      set(state => ({
        pendingTemplates: state.pendingTemplates.filter(t => t.id !== templateId),
        allTemplates: state.allTemplates.map(t => 
          t.id === templateId ? { ...t, status: 'APPROVED' } : t
        ),
        selectedTemplate: null,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      console.error('Approve template error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Reject a pending template
   * Endpoint: POST /checker/postPatternAndSample
   */
  rejectTemplate: async (templateId, reason = '') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/checker/postPatternAndSample`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patternId: templateId,
          action: 'REJECTED',
          reason: reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to reject template' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Remove from pending list and update all templates list
      set(state => ({
        pendingTemplates: state.pendingTemplates.filter(t => t.id !== templateId),
        allTemplates: state.allTemplates.map(t => 
          t.id === templateId ? { ...t, status: 'REJECTED' } : t
        ),
        selectedTemplate: null,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      console.error('Reject template error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ============================================
  // TEMPLATE MANAGEMENT (for All Templates tab)
  // ============================================

  /**
   * Deactivate an approved template
   * Sets status to INACTIVE (or you can use a different status)
   */
  deactivateTemplate: async (templateId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/checker/postPatternAndSample`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patternId: templateId,
          action: 'REJECTED', // Or create a new INACTIVE status
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to deactivate template' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update in all templates list
      set(state => ({
        allTemplates: state.allTemplates.map(t => 
          t.id === templateId ? { ...t, status: 'REJECTED' } : t
        ),
        isLoading: false,
      }));

      return result;
    } catch (error) {
      console.error('Deactivate template error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ============================================
  // FILTERING & SELECTION
  // ============================================

  /**
   * Set status filter for All Templates view
   */
  setStatusFilter: (status) => {
    set({ statusFilter: status });
  },

  /**
   * Get filtered templates based on current status filter
   */
  getFilteredTemplates: () => {
    const { allTemplates, statusFilter } = get();
    if (statusFilter === 'ALL') {
      return allTemplates;
    }
    return allTemplates.filter(t => t.status === statusFilter);
  },

  /**
   * Get pending templates
   */
  getPendingTemplates: () => {
    return get().pendingTemplates;
  },

  /**
   * Set selected template for review
   */
  setSelectedTemplate: (template) => {
    set({ selectedTemplate: template });
  },

  /**
   * Clear selected template
   */
  clearSelectedTemplate: () => {
    set({ selectedTemplate: null });
  },

  // ============================================
  // UTILITY
  // ============================================

  /**
   * Clear any errors
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      pendingTemplates: [],
      allTemplates: [],
      selectedTemplate: null,
      isLoading: false,
      error: null,
      statusFilter: 'ALL',
    });
  },
}));
