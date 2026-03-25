import { create } from "zustand";
import type { UserRole, ActiveNav } from "@/types/domain/global";

interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
  activeNav: ActiveNav;

  setUser: (u: AuthState["user"]) => void;
  logout: () => void;
  setNav: (nav: ActiveNav) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "1",
    name: "xxx",
    role: "student",
  },
  activeNav: "experiment",

  setUser: (user) => set({ user }),

  logout: () => set({ user: { id: "", name: "", role: "student" } }),
  setNav: (nav) => set({ activeNav: nav }),
}));
