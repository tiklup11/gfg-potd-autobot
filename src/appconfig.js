// Non-empty process environment variables take precedence over the defaults set below.

const defaults = Object.freeze({
  port: 1289,
  cronSchedule: "0 15,18,21,23 * * *",
  cronTimezone: "Asia/Kolkata",
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
});

function stringFromEnvironment(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value : fallback;
}

function numberFromEnvironment(name, fallback) {
  const value = stringFromEnvironment(name);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return parsed;
}

module.exports = Object.freeze({
  port: numberFromEnvironment("PORT", defaults.port),
  cronSchedule: stringFromEnvironment(
    "CRON_SCHEDULE",
    defaults.cronSchedule,
  ),
  cronTimezone: stringFromEnvironment(
    "CRON_TIMEZONE",
    defaults.cronTimezone,
  ),
  smtp: Object.freeze({
    host: stringFromEnvironment("SMTP_HOST", defaults.smtpHost),
    port: numberFromEnvironment("SMTP_PORT", defaults.smtpPort),
    user: stringFromEnvironment("SMTP_USER"),
    password: stringFromEnvironment("SMTP_PASSWORD"),
    reportEmail: stringFromEnvironment("REPORT_EMAIL"),
  }),
});
