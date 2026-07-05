/**
 * config/db.ts — re-exports from src/db/index.ts (Phase 1).
 * Kept for backward compatibility during refactoring.
 * Import from src/db/ directly in new code.
 */
export { connectDB, disconnectDB } from "../db/index";
