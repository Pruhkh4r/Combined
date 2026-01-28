import { create } from 'zustand';

// Default extracted data with -1 placeholders
export const defaultExtractedData = {
  accountNumber: '-1',
  amount: '-1',
  type: '-1',
  vendor: '-1',
  date: '-1',
  time: '-1',
  transactionId: '-1',
  bankName: '-1',
};

const API_BASE_URL = 'http://localhost:8080';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  console.log('Auth token present:', !!token);
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to map backend response to frontend data structure
// Handles both RegexMatchResponse and PatternMatchResult formats
const mapExtractedData = (backendResponse) => {
  if (!backendResponse.matched) {
    return defaultExtractedData;
  }

  // Get extracted fields from either response type
  const fields = backendResponse.extractedFields || {};
  
  // If no fields were extracted, return defaults
  if (Object.keys(fields).length === 0) {
    return defaultExtractedData;
  }
  
  return {
    accountNumber: fields.accountNumber || '-1',
    amount: fields.amount || '-1',
    type: fields.via?.toUpperCase() || fields.transactionType?.toUpperCase() || '-1',
    vendor: fields.from || fields.to || '-1',
    date: fields.date || '-1',
    time: fields.time || '-1',
    transactionId: fields.referenceNumber || '-1',
    bankName: fields.bankName || '-1',
    availableBalance: fields.availableBalance || '-1',
  };
};

export const useParserStore = create((set, get) => ({
  rawMessage: '',
  extractedData: defaultExtractedData,
  backendResponse: null, // Store full backend response
  isEditing: false,
  isLoading: false,
  error: null,

  setRawMessage: (message) => set({ rawMessage: message }),

  /**
   * Parse a message - two modes:
   * 1. With pattern: Tests a specific regex pattern (for Maker)
   * 2. Without pattern: Matches against all approved patterns in DB (for User)
   */
  parseMessage: async (message, pattern) => {
    set({ isLoading: true, error: null });
    
    try {
      let response;
      
      if (pattern) {
        // Mode 1: Test with specific pattern (Maker flow)
        console.log('Testing message with specific pattern:', pattern);
        response = await fetch(`${API_BASE_URL}/user/matchRegex`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            pattern: pattern,
            inputString: message,
          }),
        });
      } else {
        // Mode 2: Match against approved patterns in DB (User flow)
        console.log('Matching message against approved patterns');
        response = await fetch(`${API_BASE_URL}/user/matchPattern`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            inputString: message,
          }),
        });
      }

      if (!response.ok) { 
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response body:', errorText);
        
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        
        if (response.status === 403) {
          errorMessage = 'Access denied. Please log in again.';
        }
        
        throw new Error(errorMessage);
      }

      const backendResponse = await response.json();
      console.log('Backend response:', backendResponse);
      
      // Map backend response to frontend format
      const mappedData = mapExtractedData(backendResponse);
      console.log('Mapped extracted data:', mappedData);
      
      set({ 
        extractedData: mappedData, 
        backendResponse: backendResponse,
        rawMessage: message, 
        isLoading: false 
      });
      return mappedData;
    } catch (error) {
      console.error('Parsing error:', error);
      set({ error: error.message, isLoading: false });
      return defaultExtractedData;
    }
  },

  updateExtractedField: (field, value) => {
    set(state => ({
      extractedData: { ...state.extractedData, [field]: value },
    }));
  },

  setIsEditing: (editing) => set({ isEditing: editing }),

  resetParser: () => set({
    rawMessage: '',
    extractedData: defaultExtractedData,
    backendResponse: null,
    isEditing: false,
    isLoading: false,
    error: null,
  }),
}));