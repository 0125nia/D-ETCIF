// Package constants
// D-ETCIF-frontend/src/constants/storage.ts
export const STORAGE_KEYS = {
  token: "token",
  role: "role",
  user: "user",
  experimentId: "experimentId",
  experimentStage: "experimentStage",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
