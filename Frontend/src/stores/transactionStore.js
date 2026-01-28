import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],

      saveTransaction: (transactionData, userId) => {
        const newTransaction = {
          id: crypto.randomUUID(),
          ...transactionData,
          userId,
          savedAt: new Date().toISOString(),
        };

        set(state => ({
          transactions: [...state.transactions, newTransaction],
        }));

        return newTransaction;
      },

      getTransactionsByUser: (userId) => {
        return get().transactions.filter(t => t.userId === userId);
      },

      getTransactionsByType: (userId, type) => {
        return get().transactions.filter(
          t => t.userId === userId && t.type === type
        );
      },

      deleteTransaction: (transactionId) => {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== transactionId),
        }));
      },

      clearAllTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);
