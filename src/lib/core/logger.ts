/**
 * Structured logger — replaces raw console.log in production code.
 * In production builds, only warn/error emit output.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel =
  import.meta.env.MODE === "production" ? "warn" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatMessage(domain: string, message: string): string {
  return `[${domain}] ${message}`;
}

export function createLogger(domain: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (!shouldLog("debug")) return;
      if (data) console.debug(formatMessage(domain, message), data);
      else console.debug(formatMessage(domain, message));
    },
    info(message: string, data?: Record<string, unknown>) {
      if (!shouldLog("info")) return;
      if (data) console.info(formatMessage(domain, message), data);
      else console.info(formatMessage(domain, message));
    },
    warn(message: string, data?: Record<string, unknown>) {
      if (!shouldLog("warn")) return;
      if (data) console.warn(formatMessage(domain, message), data);
      else console.warn(formatMessage(domain, message));
    },
    error(message: string, error?: unknown) {
      if (!shouldLog("error")) return;
      console.error(formatMessage(domain, message), error);
    },
  };
}
