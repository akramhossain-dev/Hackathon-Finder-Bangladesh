import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";

// ── Route imports ──────────────────────────────────────────────────────────
import healthRouter from "./routes/health.routes";

// ── Phase 1+: uncomment and wire routes as they are implemented ────────────
// import authRouter from "./routes/auth.routes";
// import hackathonRouter from "./routes/hackathon.routes";

const app: Application = express();

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// ── Request parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logging ───────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api", healthRouter);

// Phase 1+: mount versioned API routes
// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/hackathons", hackathonRouter);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (Phase 1 will expand this) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[GlobalErrorHandler]", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
