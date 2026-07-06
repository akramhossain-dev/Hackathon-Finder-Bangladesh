/**
 * store/index.ts — Global state management (Phase 1 scaffold).
 *
 * Phase 2 implementation:
 *  - Install Zustand: npm install zustand
 *  - Create useAuthStore (access token in memory, never localStorage)
 *
 * Example store (Phase 2):
 *
 *   import { create } from "zustand";
 *
 *   interface AuthState {
 *     accessToken: string | null;
 *     user: { _id: string; role: UserRole } | null;
 *     setAuth: (token: string, user: AuthState["user"]) => void;
 *     clearAuth: () => void;
 *   }
 *
 *   export const useAuthStore = create<AuthState>((set) => ({
 *     accessToken: null,
 *     user: null,
 *     setAuth: (accessToken, user) => set({ accessToken, user }),
 *     clearAuth: () => set({ accessToken: null, user: null }),
 *   }));
 *
 * See docs/AUTH.md for the full token strategy.
 */

export {};
