import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types";

/**
 * authorize.ts — Role-based access control middleware (Phase 2).
 *
 * Must be used AFTER authenticate() middleware.
 *
 * Usage:
 *   router.delete("/hackathons/:id", authenticate, authorize("admin"), controller.delete)
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${roles.join(" or ")}`
        )
      );
    }

    next();
  };
}
