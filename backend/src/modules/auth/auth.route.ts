import { Router } from "express";
import { validateBody } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { registerSchema, loginSchema } from "./auth.validation";
import * as authController from "./auth.controller";

/**
 * auth.route.ts — Auth route definitions (Phase 2).
 *
 * Routes:
 *   POST   /register  → public
 *   POST   /login     → public
 *   POST   /refresh   → public (uses httpOnly cookie)
 *   POST   /logout    → semi-protected (clears cookie regardless)
 *   GET    /me        → protected (requires valid access token)
 */

const authRouter = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login",    validateBody(loginSchema),    authController.login);
authRouter.post("/refresh",                                authController.refresh);
authRouter.post("/logout",                                 authController.logout);

// ── Protected routes ──────────────────────────────────────────────────────────

authRouter.get("/me", authenticate, authController.me);

export default authRouter;
