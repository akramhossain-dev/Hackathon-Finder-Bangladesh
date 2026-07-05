import { Response } from "express";

/**
 * ApiResponse.ts — Standardized HTTP response helpers (Phase 1).
 *
 * Enforces the global response envelope across all endpoints:
 *
 * Success: { success: true,  message: string, data?: T }
 * Error:   { success: false, message: string, errors?: unknown[] }
 *          (errors are sent by errorHandler, not here)
 *
 * Usage in controllers:
 *   sendSuccess(res, "Hackathons fetched", { hackathons });
 *   sendCreated(res, "Hackathon created", { hackathon });
 *   sendNoContent(res);
 */

export interface SuccessBody<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

// ── Core send helpers ─────────────────────────────────────────────────────────

export function sendSuccess<T>(res: Response, message: string, data?: T): Response {
  const body: SuccessBody<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(200).json(body);
}

export function sendCreated<T>(res: Response, message: string, data?: T): Response {
  const body: SuccessBody<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(201).json(body);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

// ── Paginated response ────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedBody<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: PaginationMeta
): Response {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  } satisfies PaginatedBody<T>);
}

// ── Pagination calculation helper ─────────────────────────────────────────────

export function buildPagination(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
