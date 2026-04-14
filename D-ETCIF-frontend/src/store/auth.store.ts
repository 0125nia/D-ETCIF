// Package store
// D-ETCIF-frontend/src/store/auth.store.ts
import { create } from "zustand";
import type { UserRole } from "@/types/login";
import type { ActiveNav } from "@/types/nav";
import { STORAGE_KEYS } from "@/constants/storage";

export interface AuthUser {
  id: number;
  user_number: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  activeNav: ActiveNav;

  initFromStorage: () => void;
  loginSuccess: (payload: {
    token: string;
    role: UserRole;
    user?: AuthUser;
  }) => void;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;
  setNav: (nav: ActiveNav) => void;
}

export const useAuthStore = create<AuthState>((set, _) => ({
  user: null,
  token: null,
  activeNav: "experiment",

  initFromStorage: () => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const role = localStorage.getItem(STORAGE_KEYS.role) as UserRole | null;

    if (!token || !role) return;

    set({
      token,
      user: { id: 0, user_number: "", name: "", role },
    });
  },

  // 只保留登录成功后的状态更新
  loginSuccess: ({ token, role, user }) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.role, role);

    set({
      token,
      user: user ?? { id: 0, user_number: "", name: "", role },
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.role);
    set({ user: null, token: null, activeNav: "experiment" });
  },

  setUser: (user) => set({ user }),
  setNav: (nav) => set({ activeNav: nav }),
}));
