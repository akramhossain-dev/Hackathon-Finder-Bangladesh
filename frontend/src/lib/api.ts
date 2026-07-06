import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clientEnv } from "@/config/env";

/**
 * api.ts — Axios HTTP client (Phase 1).
 *
 * Provides a pre-configured Axios instance with:
 *  - Base URL from NEXT_PUBLIC_API_URL
 *  - JSON headers by default
 *  - Request interceptor: attach Bearer token (Phase 2 — slot is ready)
 *  - Response interceptor: unwrap data envelope + handle 401 refresh (Phase 2)
 *
 * Usage (Phase 2+):
 *   import api from "@/lib/api"
 *   const { data } = await api.get<HackathonListResponse>("/hackathons")
 */

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // send HttpOnly refresh-token cookie automatically
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * Phase 2: Read access token from in-memory store and attach:
     *
     *   const token = useAuthStore.getState().accessToken;
     *   if (token) {
     *     config.headers.Authorization = `Bearer ${token}`;
     *   }
     */
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    /**
     * Phase 2: Unwrap the { success, message, data } envelope here
     * so callers receive `data` directly without .data.data nesting:
     *
     *   return response.data?.data ?? response;
     */
    return response;
  },
  async (error: AxiosError) => {
    /**
     * Phase 2: Silent token refresh on 401:
     *
     *   if (error.response?.status === 401 && !originalRequest._retry) {
     *     originalRequest._retry = true;
     *     await refreshAccessToken();         // calls POST /auth/refresh
     *     return api(originalRequest);        // retry original request
     *   }
     */

    // Normalise error for consistent handling across the app
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
    // Server responded with a non-2xx status
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
    // Request was sent but no response received
    return {
      message: "No response from server. Check your network connection.",
      status: 0,
    };
  }

  // Request setup error
  return {
    message: error.message ?? "Unexpected error",
    status: 0,
  };
}

export default api;
