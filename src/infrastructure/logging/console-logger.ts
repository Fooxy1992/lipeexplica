import type { Logger, LogContext } from "@/core/application/ports/logger";

/**
 * Structured JSON logger. One line per event — Vercel/most collectors
 * parse this natively. Swap for pino/datadog by re-implementing the port.
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly base: LogContext = {}) {}

  private write(level: "info" | "warn" | "error", event: string, context?: LogContext) {
    const entry = JSON.stringify({
      level,
      event,
      ts: new Date().toISOString(),
      ...this.base,
      ...context,
    });
    if (level === "error") console.error(entry);
    else if (level === "warn") console.warn(entry);
    else console.log(entry);
  }

  info(event: string, context?: LogContext): void {
    this.write("info", event, context);
  }
  warn(event: string, context?: LogContext): void {
    this.write("warn", event, context);
  }
  error(event: string, context?: LogContext): void {
    this.write("error", event, context);
  }
  child(base: LogContext): Logger {
    return new ConsoleLogger({ ...this.base, ...base });
  }
}
