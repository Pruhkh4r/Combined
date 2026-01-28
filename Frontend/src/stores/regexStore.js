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

export const useRegexStore = create(
  persist(
    (set, get) => ({
      templates: [],
      currentDraft: null,
      isLoading: false,
      error: null,

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

      submitForApproval: async (pattern, testMessage) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/maker/postPatternAndSample`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              pattern: pattern,
              testMessage: testMessage,
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

      approveTemplate: (templateId) => {
        set(state => ({
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, status: 'approved', updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      rejectTemplate: (templateId) => {
        set(state => ({
          templates: state.templates.map(t =>
            t.id === templateId ? { ...t, status: 'rejected', updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      getTemplatesByStatus: (status) => {
        return get().templates.filter(t => t.status === status);
      },

      getPendingTemplates: () => {
        return get().templates.filter(t => t.status === 'pending');
      },

      setCurrentDraft: (draft) => set({ currentDraft: draft }),
    }),
    {
      name: 'regex-storage',
    }
  )
);