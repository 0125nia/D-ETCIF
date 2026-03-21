import axios from "axios";

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

/**
 * request 拦截
 */
request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

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
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);
