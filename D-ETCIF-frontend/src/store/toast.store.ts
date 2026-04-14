// Package store
// D-ETCIF-frontend/src/store/toast.store.ts
import { create } from "zustand";

interface ToastState {
  message: string;
  type: "success" | "error" | "warning";
  isVisible: boolean;
  show: (message: string, type?: "success" | "error" | "warning") => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "success",
  isVisible: false,
  show: (message, type = "success") => set({ message, type, isVisible: true }),
  hide: () => set({ isVisible: false }),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, "success"),
  error: (msg: string) => useToastStore.getState().show(msg, "error"),
  warning: (msg: string) => useToastStore.getState().show(msg, "warning"),
};
