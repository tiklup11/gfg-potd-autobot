const test = require("node:test");
const assert = require("node:assert/strict");

test("default cron schedule starts at 10 AM and repeats every three hours", () => {
  const previousSchedule = process.env.CRON_SCHEDULE;
  delete process.env.CRON_SCHEDULE;
  delete require.cache[require.resolve("../src/appconfig")];

  try {
    const appConfig = require("../src/appconfig");
    assert.equal(appConfig.cronSchedule, "0 10,13,16,19,22 * * *");
  } finally {
    if (previousSchedule === undefined) {
      delete process.env.CRON_SCHEDULE;
    } else {
      process.env.CRON_SCHEDULE = previousSchedule;
    }
    delete require.cache[require.resolve("../src/appconfig")];
  }
});
