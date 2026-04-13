import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { clearTokens, getAccessToken } from "@/lib/auth-tokens";

export const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
