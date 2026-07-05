/**
 * api.ts — Phase 0 stub.
 *
 * Phase 1 will implement:
 *  - Axios instance with baseURL from NEXT_PUBLIC_API_URL
 *  - Request interceptor: attach Bearer token
 *  - Response interceptor: handle 401 → silent refresh → retry
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export { API_BASE_URL };
