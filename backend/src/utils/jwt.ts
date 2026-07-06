import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../types";

/**
 * jwt.ts — JWT helper utilities (Phase 2).
 *
 * Provides:
 *  - signAccessToken(payload)
 *  - signRefreshToken(payload)
 *  - verifyAccessToken(token)
 *  - verifyRefreshToken(token)
 */

// ── Token payload shape ───────────────────────────────────────────────────────

export interface TokenPayload {
  _id: string;
  role: UserRole;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

// ── Sign helpers ──────────────────────────────────────────────────────────────

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

// ── Verify helpers ────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
}

export function verifyRefreshToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
}
