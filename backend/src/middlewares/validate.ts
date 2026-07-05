import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny, z } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * validate.ts — Zod request validation middleware (Phase 1).
 *
 * Usage (Phase 2+):
 *   router.post("/register", validate(registerSchema), authController.register)
 *
 * The schema should validate a shape of { body?, query?, params? }:
 *   const registerSchema = z.object({
 *     body: z.object({ email: z.string().email(), password: z.string().min(8) }),
 *   });
 *
 * On success:  req.body / req.query / req.params are replaced with parsed data.
 * On failure:  throws ApiError(400) with field-level error messages.
 */
export function validate(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      // Replace with validated + coerced values
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 uses .issues (v3 used .errors — both are aliased in v4)
        const issues = error.issues ?? [];
        const errors = issues.map((issue) => ({
          field: issue.path.slice(1).join("."), // strip leading "body"/"query" segment
          message: issue.message,
        }));

        next(new ApiError(400, "Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
}

// ── Convenience: validate only the body (most common case) ───────────────────
export function validateBody<T extends ZodTypeAny>(schema: T) {
  return validate(z.object({ body: schema }));
}
