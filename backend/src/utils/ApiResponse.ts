/**
 * ApiResponse.ts — Standard success response wrapper.
 *
 * Ensures consistent response shape across all endpoints:
 * { success: true, message: string, data?: T }
 */
export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data?: T;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static ok<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(message, data);
  }

  static created<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(message, data);
  }
}
