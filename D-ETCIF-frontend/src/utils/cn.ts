// Package utils
// D-ETCIF-frontend/src/utils/cn.ts
type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}
