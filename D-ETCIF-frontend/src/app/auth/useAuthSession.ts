// Package auth
// D-ETCIF-frontend/src/app/auth/useAuthSession.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "@/services/requests";
import { useAuthStore } from "@/store";

// 统一在应用层处理 401：登出 + 跳登录（请求层本身不做跳转）
export function useAuthSession() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const id = request.interceptors.response.use(
      (res) => res,
      (err) => {
        const isLoginApi = err?.config?.url === "/api/login";
        const status = err?.response?.status;

        if (status === 401 && !isLoginApi) {
          logout();
          navigate("/login", { replace: true });
        }

        return Promise.reject(err);
      },
    );

    return () => {
      request.interceptors.response.eject(id);
    };
  }, [logout, navigate]);
}
