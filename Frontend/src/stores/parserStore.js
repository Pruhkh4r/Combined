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
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to map backend response to frontend data structure
const mapExtractedData = (backendResponse) => {
  if (!backendResponse.matched || !backendResponse.extractedFields) {
    return defaultExtractedData;
  }

  const fields = backendResponse.extractedFields;
  
  return {
    accountNumber: fields.accountNumber || '-1',
    amount: fields.amount || '-1',
    type: fields.via?.toUpperCase() || '-1', // via field represents transaction type
    vendor: fields.to || '-1', // to field represents vendor/payee
    date: fields.date || '-1',
    time: fields.time || '-1',
    transactionId: fields.referenceNumber || '-1', // referenceNumber maps to transactionId
    bankName: fields.bankName || '-1',
    // Additional fields from backend response
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

  parseMessage: async (message, pattern) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Parsing message with pattern:', pattern);
      const response = await fetch(`${API_BASE_URL}/maker/matchRegex`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          pattern: pattern,
          inputString: message,
        }),
      });

      if (!response.ok) { 
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
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