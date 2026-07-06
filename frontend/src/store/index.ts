/**
 * store/index.ts — Global state management (Phase 2).
 *
 * Auth state is handled via React Context (AuthContext).
 * See: src/context/AuthContext.tsx
 *
 * This file re-exports the auth hook for convenience so that
 * importing from "@/store" works as a stable, phase-agnostic API.
 *
 * Phase 3+: Add other lightweight state (e.g. hackathon filters)
 * here as needed, using the same context-based pattern.
 */

export { useAuth } from "@/context/AuthContext";
export type { SafeUser } from "@/services/auth.api";
