import { Router } from "express";
import healthRouter from "./health.routes";
import authRouter from "../modules/auth/auth.route";

/**
 * routes/index.ts — Central API v1 router.
 *
 * All versioned feature routes mount here.
 * app.ts mounts this at /api/v1
 *
 * Mounting pattern:
 *   router.use("/auth",         authRouter);         // Phase 2 ✅
 *   router.use("/hackathons",   hackathonRouter);    // Phase 3
 *   router.use("/users",        userRouter);         // Phase 3
 *   router.use("/organizers",   organizerRouter);    // Phase 4
 *   router.use("/categories",   categoryRouter);     // Phase 4
 *   router.use("/bookmarks",    bookmarkRouter);     // Phase 5
 *   router.use("/reminders",    reminderRouter);     // Phase 5
 *   router.use("/submissions",  submissionRouter);   // Phase 6
 *   router.use("/admin",        adminRouter);        // Phase 7
 */
const router = Router();

// ── Phase 1 ──────────────────────────────────────────────────────────────────
router.use("/", healthRouter);

// ── Phase 2 — Auth ────────────────────────────────────────────────────────────
router.use("/auth", authRouter);

// ── Phase 3+: uncomment as features are implemented ──────────────────────────
// router.use("/hackathons",  hackathonRouter);
// router.use("/users",       userRouter);

export default router;
