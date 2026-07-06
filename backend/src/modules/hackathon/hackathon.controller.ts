import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendCreated } from "../../utils/ApiResponse";
import * as hackathonService from "./hackathon.service";
import { ListQuery } from "./hackathon.validation";

/**
 * hackathon.controller.ts — HTTP handlers for hackathon routes (Phase 3).
 *
 * Public:
 *   list(req, res, next)       → GET /hackathons
 *   getBySlug(req, res, next)  → GET /hackathons/:slug
 *
 * Internal/admin (Phase 4+ — not exposed via public router yet):
 *   create(req, res, next)
 *   updateById(req, res, next)
 *   removeById(req, res, next)
 */

// ── GET /api/v1/hackathons ────────────────────────────────────────────────────

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // req.query is already validated+coerced by the validate middleware
    const { hackathons, pagination } = await hackathonService.listPublished(
      req.query as unknown as ListQuery
    );

    res.status(200).json({
      success: true,
      message: "Hackathons fetched successfully",
      data: { hackathons },
      pagination,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/hackathons/:slug ──────────────────────────────────────────────

export async function getBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = req.params["slug"] as string;
    const hackathon = await hackathonService.getPublishedBySlug(slug);
    sendSuccess(res, "Hackathon fetched successfully", { hackathon });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/hackathons (internal admin foundation) ──────────────────────

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hackathon = await hackathonService.create(req.body);
    sendCreated(res, "Hackathon created successfully", { hackathon });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/v1/hackathons/:id (internal admin foundation) ─────────────────

export async function updateById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params["id"] as string;
    const hackathon = await hackathonService.update(id, req.body);
    sendSuccess(res, "Hackathon updated successfully", { hackathon });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/v1/hackathons/:id (internal admin foundation) ─────────────────

export async function removeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params["id"] as string;
    await hackathonService.remove(id);
    sendSuccess(res, "Hackathon deleted successfully");
  } catch (err) {
    next(err);
  }
}
