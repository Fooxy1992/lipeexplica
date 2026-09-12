/**
 * Typed domain errors. API routes and pages map `code` to HTTP status,
 * keeping transport concerns out of use cases.
 */
export type DomainErrorCode =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "CONFLICT"
  | "PAYMENT"
  | "INTERNAL";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const httpStatusFor: Record<DomainErrorCode, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  VALIDATION: 422,
  CONFLICT: 409,
  PAYMENT: 402,
  INTERNAL: 500,
};
