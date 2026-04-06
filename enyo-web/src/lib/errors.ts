/**
 * Base application error class. All custom errors extend this.
 * Carries an HTTP-compatible statusCode for use in API route handlers.
 */
export class AppError extends Error {
  /** HTTP status code associated with this error. */
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when request data fails validation (HTTP 400). */
export class ValidationError extends AppError {
  /** Per-field validation error messages, if available. */
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string = 'Validation failed', fieldErrors?: Record<string, string[]>) {
    super(message, 400);
    this.fieldErrors = fieldErrors;
  }
}

/** Thrown when a requested resource does not exist (HTTP 404). */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/** Thrown when the user is not authenticated (HTTP 401). */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/** Thrown when the user lacks permission for the requested action (HTTP 403). */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/** Thrown when the request conflicts with existing state (HTTP 409). */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
