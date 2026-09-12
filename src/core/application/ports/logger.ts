/** Structured logger port. */
export type LogContext = Record<string, unknown>;

export interface Logger {
  info(event: string, context?: LogContext): void;
  warn(event: string, context?: LogContext): void;
  error(event: string, context?: LogContext): void;
  child(base: LogContext): Logger;
}
