// Package services
// D-ETCIF-frontend/src/services/requests.ts
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { STORAGE_KEYS } from "@/constants/storage";
import { API_BASE_URL } from "@/services/api";

// 自定义Axios实例类型，确保TypeScript知道我们的拦截器已经处理了响应数据
type CustomAxiosInstance = {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
} & Omit<AxiosInstance, "get" | "post" | "put" | "delete">;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

/**
 * request 拦截
 */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * response 拦截
 */
instance.interceptors.response.use(
  (res) => {
    // 统一处理响应数据，直接返回业务数据
    // 检查响应是否包含 data 字段
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return res.data.data;
    }
    return res.data;
  },
  (err) => {
    const isLoginApi = err.config.url === "/api/login";

    // 只有【不是登录接口】的 401 才自动跳登录
    if (err.response?.status === 401 && !isLoginApi) {
      localStorage.removeItem(STORAGE_KEYS.token);
      window.location.href = "/login";
      return Promise.reject(new Error("未授权，请重新登录"));
    }

    return Promise.reject(err);
  },
);

export const request = instance as CustomAxiosInstance;
