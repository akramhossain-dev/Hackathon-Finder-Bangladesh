import { Router } from "express";
import { validate, validateBody } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  listQuerySchema,
  slugParamSchema,
  createHackathonSchema,
  updateHackathonSchema,
} from "./hackathon.validation";
import * as hackathonController from "./hackathon.controller";
import { z } from "zod";

/**
 * hackathon.route.ts — Hackathon route definitions (Phase 3).
 *
 * Public routes (no auth):
 *   GET  /hackathons          → list published hackathons (with filters)
 *   GET  /hackathons/:slug    → single published hackathon
 *
 * Internal/admin routes (auth + admin role — wired here but protected):
 *   POST   /hackathons         → create hackathon
 *   PATCH  /hackathons/:id     → update hackathon
 *   DELETE /hackathons/:id     → delete hackathon
 */

const hackathonRouter = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

hackathonRouter.get(
  "/",
  validate(z.object({ query: listQuerySchema })),
  hackathonController.list
);

hackathonRouter.get(
  "/:slug",
  validate(z.object({ params: slugParamSchema })),
  hackathonController.getBySlug
);

// ── Admin-only routes (Phase 4: move to admin router if preferred) ────────────

hackathonRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  validateBody(createHackathonSchema),
  hackathonController.create
);

hackathonRouter.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateBody(updateHackathonSchema),
  hackathonController.updateById
);

hackathonRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  hackathonController.removeById
);

export default hackathonRouter;
