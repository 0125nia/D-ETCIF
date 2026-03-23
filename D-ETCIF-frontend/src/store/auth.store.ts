import { create } from "zustand";
import type { UserRole } from "@/types/domain/global";

interface AuthState {
  user: null | {
    id: string;
    name: string;
    role: UserRole;
  };

  setUser: (u: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),
}));
