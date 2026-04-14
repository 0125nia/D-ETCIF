// Package services
// D-ETCIF-frontend/src/services/auth.ts
import { API } from "./api";
import { request } from "./requests";
import type { LoginRes, UserRole } from "@/types/login";

export function loginApi(
  username: string,
  password: string,
  role: UserRole,
): Promise<LoginRes> {
  console.log("请求地址：/api/login，请求方法：POST");
  return request({
    method: "POST",
    url: API.login,
    data: { username, password, role },
  });
}

export function convertRole(role: number): "student" | "teacher" {
  return role === 1 ? "student" : "teacher";
}
