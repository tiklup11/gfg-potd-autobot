const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createDailyRunGuard,
  dateInTimezone,
} = require("../src/daily_run_guard");

test("daily guard skips later runs after a success on the same day", async () => {
  let runCount = 0;
  const skippedDates = [];
  const guardedRun = createDailyRunGuard({
    run: async () => {
      runCount += 1;
      return true;
    },
    getDate: () => "2026-07-20",
    onSkip: (date) => skippedDates.push(date),
  });

  assert.equal(await guardedRun(), true);
  assert.equal(await guardedRun(), false);
  assert.equal(runCount, 1);
  assert.deepEqual(skippedDates, ["2026-07-20"]);
});

test("daily guard retries after a failed run", async () => {
  const results = [false, true];
  let runCount = 0;
  const guardedRun = createDailyRunGuard({
    run: async () => results[runCount++],
    getDate: () => "2026-07-20",
  });

  assert.equal(await guardedRun(), false);
  assert.equal(await guardedRun(), true);
  assert.equal(await guardedRun(), false);
  assert.equal(runCount, 2);
});

test("daily guard runs again on the next day", async () => {
  let currentDate = "2026-07-20";
  let runCount = 0;
  const guardedRun = createDailyRunGuard({
    run: async () => {
      runCount += 1;
      return true;
    },
    getDate: () => currentDate,
  });

  assert.equal(await guardedRun(), true);
  currentDate = "2026-07-21";
  assert.equal(await guardedRun(), true);
  assert.equal(runCount, 2);
});

test("dateInTimezone uses the configured timezone", () => {
  const instant = new Date("2026-07-20T20:00:00.000Z");

  assert.equal(dateInTimezone(instant, "UTC"), "2026-07-20");
  assert.equal(dateInTimezone(instant, "Asia/Kolkata"), "2026-07-21");
});
