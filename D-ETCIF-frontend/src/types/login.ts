// Package types
// D-ETCIF-frontend/src/types/login.ts
export type UserRole = "student" | "teacher";

export interface LoginRes {
  token: string;
  user: {
    id: number;
    user_number: string;
    name: string;
    role: number;
  };
}
