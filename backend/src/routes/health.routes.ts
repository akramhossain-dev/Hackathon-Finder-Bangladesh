import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * GET /api/v1/health
 * Public health check — used by load balancers, uptime monitors, and CI/CD pipelines.
 *
 * Phase 1: includes MongoDB connection state in response.
 * Phase 1+: extend with Redis ping when BullMQ is wired.
 */
router.get("/health", (_req: Request, res: Response) => {
  // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? "connected"
      : dbState === 2
        ? "connecting"
        : "disconnected";

  const status = dbState === 1 ? 200 : 503;

  res.status(status).json({
    success: dbState === 1,
    message: dbState === 1 ? "Backend is running" : "Backend degraded — DB not connected",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      // Phase 1+: redis: redisStatus,
    },
  });
});

export default router;
