import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./db/index";

/**
 * server.ts — Application entry point (Phase 1).
 *
 * Boot sequence:
 *  1. Load + validate environment variables (done by config/env.ts import)
 *  2. Connect to MongoDB
 *  3. Start Express HTTP server
 *  4. Register graceful shutdown handlers
 */

async function startServer(): Promise<void> {
  // Step 1: env is already validated by the import above (Zod schema)

  // Step 2: connect to MongoDB before accepting traffic
  await connectDB();

  // Step 3: start the HTTP server
  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`   Environment  : ${env.NODE_ENV}`);
    console.log(`   API base     : http://localhost:${env.PORT}/api/v1`);
    console.log(`   Health check : http://localhost:${env.PORT}/api/v1/health\n`);
  });

  // Step 4: graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n⚡ ${signal} received — shutting down gracefully...`);

    server.close(async () => {
      console.log("🔒 HTTP server closed.");
      await disconnectDB();
      console.log("✅ Shutdown complete.\n");
      process.exit(0);
    });

    // Force-kill if graceful shutdown takes too long
    setTimeout(() => {
      console.error("⚠️  Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
  });
}

// Run — catch any startup errors (DB connection failure, invalid env, etc.)
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
