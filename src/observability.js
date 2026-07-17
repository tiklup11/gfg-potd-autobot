const isProduction = process.env.NODE_ENV === "production";
const hasNewRelicLicense = Boolean(process.env.NEW_RELIC_LICENSE_KEY?.trim());

let newRelic;
if (isProduction && hasNewRelicLicense) {
  process.env.NEW_RELIC_APP_NAME ||= "gfg-potd-bot";
  process.env.NEW_RELIC_ENABLED = "true";
  process.env.NEW_RELIC_LOG ||= "stdout";
  newRelic = require("newrelic");
}

function info(event, attributes = {}) {
  write("info", event, attributes);
}

function warn(event, attributes = {}) {
  write("warn", event, attributes);
}

function reportError(event, error, attributes = {}) {
  const normalizedError = normalizeError(error);
  const safeAttributes = sanitizeAttributes(attributes);

  write("error", event, {
    ...safeAttributes,
    errorName: normalizedError.name,
    errorMessage: normalizedError.message,
  });

  if (newRelic) {
    newRelic.noticeError(normalizedError, { event, ...safeAttributes });
  }
}

function write(level, event, attributes) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeAttributes(attributes),
  };

  const serialized = JSON.stringify(log);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }

  if (newRelic) {
    newRelic.recordLogEvent({ message: event, level, ...log });
  }
}

function sanitizeAttributes(attributes) {
  return Object.fromEntries(
    Object.entries(attributes).filter(
      ([, value]) =>
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean",
    ),
  );
}

function normalizeError(error) {
  if (error instanceof Error) {
    const normalized = new Error(sanitizeMessage(error.message));
    normalized.name = error.name || "Error";
    if (typeof error.stack === "string") {
      normalized.stack = error.stack;
    }
    return normalized;
  }
  if (typeof error === "string" && error.trim()) {
    return new Error(sanitizeMessage(error));
  }
  return new Error("Unknown error");
}

function sanitizeMessage(message) {
  return (
    String(message).replace(/\s+/g, " ").trim().slice(0, 1000) ||
    "Unknown error"
  );
}

module.exports = {
  info,
  warn,
  error: reportError,
  newRelicEnabled: Boolean(newRelic),
};
