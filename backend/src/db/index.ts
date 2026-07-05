import mongoose from "mongoose";
import { env } from "../config/env";

/**
 * connectDB — Mongoose connection with lifecycle management (Phase 1).
 *
 * Features:
 *  - Single connection instance (Mongoose manages the pool internally)
 *  - Structured startup logs
 *  - Graceful disconnect on SIGINT / SIGTERM
 *  - Models are registered automatically when imported — no work needed here
 *
 * Phase 2+: models will be imported from src/modules/<feature>/models/
 */
export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Mongoose 7+ manages pooling automatically.
      // Override these if you need tuning in production.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // fail fast on bad URI
      socketTimeoutMS: 45_000,
    });

    console.log(
      `\n✅ MongoDB connected — host: ${conn.connection.host}` +
        ` | db: ${conn.connection.name}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ MongoDB connection failed: ${message}`);
    // Exit so process managers (PM2, Docker) can restart cleanly
    process.exit(1);
  }
}

/**
 * disconnectDB — clean shutdown helper.
 * Called by the graceful shutdown handler in server.ts.
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed.");
}
