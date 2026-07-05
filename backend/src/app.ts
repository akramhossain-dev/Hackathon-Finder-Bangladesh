import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";

// ── Middleware ──────────────────────────────────────────────────────────────
import { globalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

// ── Central versioned API router ────────────────────────────────────────────
import apiV1Router from "./routes/index";

const app: Application = express();

// ══════════════════════════════════════════════════════════════════════════════
// Security layer
// ══════════════════════════════════════════════════════════════════════════════

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,           // allow cookies (refresh token HttpOnly)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Trust proxy (required for express-rate-limit behind Nginx / Railway)
app.set("trust proxy", 1);

app.use(globalLimiter);

// ══════════════════════════════════════════════════════════════════════════════
// Request parsing
// ══════════════════════════════════════════════════════════════════════════════

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ══════════════════════════════════════════════════════════════════════════════
// HTTP request logging
// ══════════════════════════════════════════════════════════════════════════════

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ══════════════════════════════════════════════════════════════════════════════
// API routes
// ══════════════════════════════════════════════════════════════════════════════

// All routes live under /api/v1/*
app.use("/api/v1", apiV1Router);

// Redirect bare /api/health → /api/v1/health for convenience
app.get("/api/health", (_req: Request, res: Response) => {
  res.redirect(307, "/api/v1/health");
});

// ══════════════════════════════════════════════════════════════════════════════
// 404 — must come after all routes
// ══════════════════════════════════════════════════════════════════════════════

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found`,
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Global error handler — must be last, must have 4 params
// ══════════════════════════════════════════════════════════════════════════════

app.use(errorHandler);

export default app;
