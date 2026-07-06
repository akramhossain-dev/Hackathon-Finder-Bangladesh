import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clientEnv } from "@/config/env";

/**
 * api.ts — Axios HTTP client (Phase 2).
 *
 * Token strategy:
 *  - Access token stored in memory (via AuthContext)
 *  - Attached to requests via the setAccessTokenGetter() setter below
 *  - On 401, we attempt a silent refresh and retry the original request
 *  - Refresh token travels as httpOnly cookie (browser sends automatically)
 */

// ── Access token getter — wired by AuthContext ────────────────────────────────

let _getAccessToken: (() => string | null) | null = null;

/** Called once by AuthProvider to wire the in-memory token into the interceptor */
export function setAccessTokenGetter(getter: () => string | null): void {
  _getAccessToken = getter;
}

// ── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // sends HttpOnly refresh-token cookie automatically
});

// ── Request interceptor: attach access token ──────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: handle 401 with silent refresh ─────────────────────

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // Attempt silent token refresh on 401 — but only once per request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      // Don't retry if the failing request IS the refresh endpoint
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // POST /auth/refresh — cookie is sent automatically
        const refreshRes = await api.post<{
          data: { accessToken: string };
        }>("/auth/refresh");

        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch {
        // Refresh failed — let the 401 propagate (AuthContext will clear state)
        return Promise.reject(normaliseError(error));
      }
    }

    return Promise.reject(normaliseError(error));
  }
);

// ── Error normalisation ───────────────────────────────────────────────────────

export interface ApiErrorPayload {
  message: string;
  status: number;
  errors?: Array<{ field: string; message: string }>;
}

function normaliseError(error: AxiosError): ApiErrorPayload {
  if (error.response) {
    const data = error.response.data as {
      message?: string;
      errors?: Array<{ field: string; message: string }>;
    };
    return {
      message: data?.message ?? "An error occurred",
      status: error.response.status,
      errors: data?.errors,
    };
  }

  if (error.request) {
    return {
      message: "No response from server. Check your network connection.",
      status: 0,
    };
  }

  return {
    message: error.message ?? "Unexpected error",
    status: 0,
  };
}

export default api;
