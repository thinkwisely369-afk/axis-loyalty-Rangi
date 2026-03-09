import { create } from "zustand";
import { apiCall } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  profile_photo_url?: string;
  email?: string;
  policy_number?: string;
  mobile_number?: string;
  policies?: { policy_number: string; customer_name?: string; policy_duration?: string; maturity_value?: string; started_date?: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  hydrate: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return { user: updated };
    });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("is_first_login");
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Hydrate from localStorage on app start
  hydrate: () => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  // Fetch fresh user data from backend (includes up-to-date policies)
  refreshUser: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    try {
      const res = await apiCall("/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const updated = { ...get().user, ...data.user };
          localStorage.setItem("user", JSON.stringify(updated));
          set({ user: updated });
        }
      }
    } catch {
      // silently fail — we still have localStorage data
    }
  },
}));
