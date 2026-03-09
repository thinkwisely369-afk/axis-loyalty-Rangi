import { create } from "zustand";
import { apiCall } from "@/lib/api";

export interface Transaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "admin";
  title: string;
  description: string;
  points: number;
  date: string;
}

interface WalletState {
  loyaltyPoints: number;
  redeemablePoints: number;
  transactions: Transaction[];
  loading: boolean;
  fetched: boolean;

  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: (perPage?: number) => Promise<void>;
  reset: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function mapTransaction(tx: any): Transaction {
  return {
    id: String(tx.id),
    type: tx.type,
    title: tx.description,
    description: tx.source || tx.type,
    points: tx.points,
    date: formatDate(tx.created_at),
  };
}

export const useWalletStore = create<WalletState>((set, get) => ({
  loyaltyPoints: 0,
  redeemablePoints: 0,
  transactions: [],
  loading: false,
  fetched: false,

  fetchWallet: async () => {
    // Skip if already fetched (use reset() to force re-fetch)
    if (get().fetched) return;

    set({ loading: true });
    try {
      const [walletRes, txRes] = await Promise.all([
        apiCall("/wallet"),
        apiCall("/wallet/transactions?per_page=20"),
      ]);

      const walletJson = await walletRes.json();
      const txJson = await txRes.json();

      set({
        loyaltyPoints: walletJson.success ? Number(walletJson.wallet.loyalty_points) : 0,
        redeemablePoints: walletJson.success ? Number(walletJson.wallet.redeemable_points) : 0,
        transactions: txJson.success && txJson.transactions?.data
          ? txJson.transactions.data.map(mapTransaction)
          : [],
        fetched: true,
      });
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async (perPage = 20) => {
    try {
      const res = await apiCall(`/wallet/transactions?per_page=${perPage}`);
      const data = await res.json();
      if (data.success && data.transactions?.data) {
        set({ transactions: data.transactions.data.map(mapTransaction) });
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  },

  reset: () => set({ fetched: false, loyaltyPoints: 0, redeemablePoints: 0, transactions: [] }),
}));
