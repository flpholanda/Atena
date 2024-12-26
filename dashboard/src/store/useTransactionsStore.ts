import { create } from "zustand";
import {
  Transaction,
  TransactionStatus,
} from "../lib/schemas/transaction.interface";
import { TransactionRepository } from "../lib/repositories/transactionsRepository";

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  addTransactions: (transactions: Transaction[]) => void;
  getPendingTransactionsBeforeToday: () => Transaction[];
  getLastTransactions: (limit?: number) => Transaction[];
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await TransactionRepository.findAll();
      set({ transactions, isLoading: false });
    } catch {
      set({ error: "Failed to fetch transactions", isLoading: false });
    }
  },

  getLastTransactions: (limit = 10) => {
    const state = get();
    const today = new Date();

    return state.transactions
      .filter((transaction) => {
        const paymentDate = new Date(transaction.paymentDate);
        return (
          paymentDate <= today &&
          transaction.status === TransactionStatus.COMPLETED
        );
      })
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )
      .slice(0, limit);
  },

  getPendingTransactionsBeforeToday: () => {
    const state = get();
    const today = new Date();

    return state.transactions.filter((transaction) => {
      const paymentDate = new Date(transaction.paymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      return (
        paymentDate <= today && transaction.status === TransactionStatus.PENDING
      );
    });
  },

  getAllTransactions: () => {
    const state = get();
    return state.transactions;
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [...state.transactions, transaction],
    }));
  },

  addTransactions: (transactions: Transaction[]) => {
    set((state) => ({
      transactions: [...state.transactions, ...transactions],
    }));
  },

  updateTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t._id === transaction._id ? transaction : t
      ),
    }));
  },

  deleteTransaction: (id: string) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t._id.toString() !== id),
    }));
  },
}));
