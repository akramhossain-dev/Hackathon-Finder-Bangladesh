import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint — used by load balancers and monitoring.
 *
 * Phase 1: extend with DB ping and Redis ping checks.
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
  });
});

export default router;
