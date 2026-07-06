import api from "@/lib/api";

/**
 * auth.api.ts — Frontend auth API service (Phase 2).
 *
 * All calls to /auth/* live here.
 * Components and context use this service — never call `api` directly.
 */

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
}

// ── Register ──────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

async function register(payload: RegisterPayload): Promise<{ user: SafeUser }> {
  const res = await api.post<{ success: true; message: string; data: { user: SafeUser } }>(
    "/auth/register",
    payload
  );
  return res.data.data;
}

// ── Login ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<{ success: true; message: string; data: AuthResponse }>(
    "/auth/login",
    payload
  );
  return res.data.data;
}

// ── Refresh ───────────────────────────────────────────────────────────────────

async function refresh(): Promise<AuthResponse> {
  const res = await api.post<{ success: true; message: string; data: AuthResponse }>(
    "/auth/refresh"
  );
  return res.data.data;
}

// ── Logout ────────────────────────────────────────────────────────────────────

async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

// ── Me ────────────────────────────────────────────────────────────────────────

async function me(): Promise<SafeUser> {
  const res = await api.get<{ success: true; message: string; data: { user: SafeUser } }>(
    "/auth/me"
  );
  return res.data.data.user;
}

// ── Exported namespace ────────────────────────────────────────────────────────

export const authApi = { register, login, refresh, logout, me };
