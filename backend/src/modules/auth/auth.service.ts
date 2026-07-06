import bcrypt from "bcrypt";
import User, { IUser } from "../../models/User";
import { ApiError } from "../../utils/ApiError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.validation";

/**
 * auth.service.ts — Business logic for auth operations (Phase 2).
 *
 * All database interaction and token logic lives here.
 * Controllers stay thin — they only call service methods.
 */

// ── Shared type for auth responses ────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

// ── Helper: strip sensitive fields ───────────────────────────────────────────

function toSafeUser(user: IUser): SafeUser {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// ── Helper: build token payload ───────────────────────────────────────────────

function buildPayload(user: IUser): TokenPayload {
  return { _id: String(user._id), role: user.role };
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password, // bcrypt hash applied by pre-save hook
    role: "user",
  });

  return toSafeUser(user);
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(
  input: LoginInput
): Promise<{ authResult: AuthResult; refreshToken: string }> {
  // Fetch user with password (select: false by default)
  const user = await User.findOne({ email: input.email }).select(
    "+password +refreshToken"
  );

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const payload = buildPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Hash and store refresh token in DB
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefresh;
  await user.save({ validateBeforeSave: false });

  return {
    authResult: { user: toSafeUser(user), accessToken },
    refreshToken,
  };
}

// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refreshTokens(
  incomingRefreshToken: string
): Promise<{ authResult: AuthResult; refreshToken: string }> {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || !user.refreshToken) {
    throw ApiError.unauthorized("Session expired. Please log in again");
  }

  // Verify stored hash matches the incoming token
  const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!isValid) {
    throw ApiError.unauthorized("Refresh token mismatch. Please log in again");
  }

  // Rotate: issue a brand-new refresh token
  const payload = buildPayload(user);
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
  user.refreshToken = hashedRefresh;
  await user.save({ validateBeforeSave: false });

  return {
    authResult: { user: toSafeUser(user), accessToken: newAccessToken },
    refreshToken: newRefreshToken,
  };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
}

// ── Get current user ──────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return toSafeUser(user);
}
