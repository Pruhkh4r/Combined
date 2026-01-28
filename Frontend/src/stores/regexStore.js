import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
 * Regex Store - For Maker functionality only
 * Handles: saving drafts, submitting for approval, local template management
 * 
 * Note: Checker functionality has been moved to checkerStore.js
 */
export const useRegexStore = create(
  persist(
    (set, get) => ({
      // Local drafts (stored in browser)
      templates: [],
      currentDraft: null,
      isLoading: false,
      error: null,

      // ============================================
      // LOCAL DRAFT MANAGEMENT
      // ============================================

      /**
       * Save a draft locally (browser storage)
       */
      saveDraft: (template, userId) => {
        const now = new Date().toISOString();
        const newTemplate = {
          id: template.id || crypto.randomUUID(),
          pattern: template.pattern || '',
          status: 'draft',
          createdBy: userId,
          createdAt: template.id ? get().templates.find(t => t.id === template.id)?.createdAt || now : now,
          updatedAt: now,
          testMessage: template.testMessage,
        };

        set(state => {
          const existingIndex = state.templates.findIndex(t => t.id === newTemplate.id);
          if (existingIndex >= 0) {
            const updated = [...state.templates];
            updated[existingIndex] = newTemplate;
            return { templates: updated };
          }
          return { templates: [...state.templates, newTemplate] };
        });
      },

      /**
       * Delete a local draft
       */
      deleteDraft: (templateId) => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== templateId),
        }));
      },

      /**
       * Get all local drafts
       */
      getDrafts: () => {
        return get().templates.filter(t => t.status === 'draft');
      },

      // ============================================
      // SUBMIT TO BACKEND (Maker → Checker flow)
      // ============================================

      /**
       * Submit pattern for approval
       * Endpoint: POST /maker/postPatternAndSample
       */
      submitForApproval: async (pattern, testMessage) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/postPatternAndSample`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              regexPattern: pattern,
              sampleEx: testMessage,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Submit error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Save pattern as draft on backend
       * Endpoint: POST /maker/postPatternAndSampleForDraft
       */
      saveDraftToBackend: async (pattern, testMessage) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/postPatternAndSampleForDraft`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              regexPattern: pattern,
              sampleEx: testMessage,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Save draft error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Fetch maker's drafts from backend
       * Endpoint: GET /maker/getDrafts
       */
      fetchDraftsFromBackend: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/getDrafts`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const drafts = await response.json();
          // Transform and merge with local drafts
          const transformed = drafts.map(p => ({
            id: p.patternId,
            pattern: p.regexPattern,
            testMessage: p.sampleEx,
            status: 'draft',
            fromBackend: true,
          }));
          
          set({ isLoading: false });
          return transformed;
        } catch (error) {
          console.error('Fetch drafts error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Fetch maker's rejected patterns from backend
       * Endpoint: GET /maker/getRejected
       */
      fetchRejectedFromBackend: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/getRejected`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const rejected = await response.json();
          const transformed = rejected.map(p => ({
            id: p.patternId,
            pattern: p.regexPattern,
            testMessage: p.sampleEx,
            status: 'rejected',
          }));
          
          set({ isLoading: false });
          return transformed;
        } catch (error) {
          console.error('Fetch rejected error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Fetch failed messages (messages that couldn't be matched to any regex)
       * Endpoint: GET /maker/getMsgsFailed
       */
      fetchFailedMessages: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/getMsgsFailed`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const failed = await response.json();
          const transformed = failed.map(p => ({
            id: p.patternId,
            pattern: p.regexPattern, // Will be null for failed messages
            sampleMessage: p.sampleEx,
            status: 'failed',
          }));
          
          set({ isLoading: false });
          return transformed;
        } catch (error) {
          console.error('Fetch failed messages error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing pattern (e.g., update a failed message with a new regex)
       * Endpoint: PUT /maker/updatePattern/{patternId}
       */
      updateExistingPattern: async (patternId, regexPattern, sampleMessage, status) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/updatePattern/${patternId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              regexPattern: regexPattern,
              sampleEx: sampleMessage,
              status: status,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Update pattern error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ============================================
      // CHECK FOR EXISTING MATCHING PATTERNS
      // ============================================

      /**
       * Check if any approved pattern matches the given message
       * Endpoint: POST /user/matchPattern
       */
      checkExistingPattern: async (inputString) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/user/matchPattern`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ inputString }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Check existing pattern error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ============================================
      // UTILITY
      // ============================================

      getTemplatesByStatus: (status) => {
        return get().templates.filter(t => t.status === status);
      },

      setCurrentDraft: (draft) => set({ currentDraft: draft }),

      clearError: () => set({ error: null }),

      reset: () => set({
        templates: [],
        currentDraft: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'regex-storage',
    }
  )
);
