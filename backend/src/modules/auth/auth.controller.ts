import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendCreated } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import { env } from "../../config/env";

/**
 * auth.controller.ts — HTTP handlers for auth routes (Phase 2).
 *
 * Controllers are thin: validate input, call service, send response.
 * All business logic lives in auth.service.ts.
 */

// ── Cookie config ─────────────────────────────────────────────────────────────

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

// ── POST /api/v1/auth/register ────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.registerUser(req.body);
    sendCreated(res, "Account created successfully", { user });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { authResult, refreshToken } = await authService.loginUser(req.body);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, "Login successful", {
      user: authResult.user,
      accessToken: authResult.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
      return;
    }

    const { authResult, refreshToken: newRefresh } =
      await authService.refreshTokens(token);

    setRefreshCookie(res, newRefresh);
    sendSuccess(res, "Token refreshed successfully", {
      user: authResult.user,
      accessToken: authResult.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Best-effort: invalidate from DB if user is identified
    if (req.user?._id) {
      await authService.logoutUser(req.user._id);
    }
    clearRefreshCookie(res);
    sendSuccess(res, "Logged out successfully");
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!._id);
    sendSuccess(res, "Current user fetched", { user });
  } catch (err) {
    next(err);
  }
}
