// Package services
// D-ETCIF-frontend/src/services/requests.ts
import axios from "axios";
import { STORAGE_KEYS } from "@/constants/storage";
import { API_BASE_URL } from "@/services/api";

export const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

/**
 * request 拦截
 */
request.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * response 拦截
 */
request.interceptors.response.use(
  (res) => {
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
