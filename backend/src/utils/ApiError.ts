/**
 * ApiError.ts — Custom error class for structured API error responses.
 *
 * Used by controllers and services to throw typed errors.
 * Caught by the global error handler in app.ts.
 *
 * Phase 1: Wire into global error handler in app.ts.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message, false);
  }
}
