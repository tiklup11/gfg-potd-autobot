const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = test;

const observabilityPath = require.resolve("../src/observability");
const newRelicPath = require.resolve("newrelic");
const environmentNames = [
  "NODE_ENV",
  "NEW_RELIC_LICENSE_KEY",
  "NEW_RELIC_APP_NAME",
  "NEW_RELIC_ENABLED",
  "NEW_RELIC_LOG",
];

test("observability records logs and errors with New Relic", () => {
  const originalEnvironment = Object.fromEntries(
    environmentNames.map((name) => [name, process.env[name]]),
  );
  const originalNewRelicCache = require.cache[newRelicPath];
  const records = [];
  const errors = [];
  const stdout = [];
  const stderr = [];

  try {
    process.env.NODE_ENV = "production";
    process.env.NEW_RELIC_LICENSE_KEY = "test-license";
    delete require.cache[observabilityPath];
    require.cache[newRelicPath] = {
      id: newRelicPath,
      filename: newRelicPath,
      loaded: true,
      exports: {
        recordLogEvent: (record) => records.push(record),
        noticeError: (error, attributes) => errors.push({ error, attributes }),
      },
    };
    mock.method(console, "log", (line) => stdout.push(line));
    mock.method(console, "error", (line) => stderr.push(line));

    const observability = require(observabilityPath);
    observability.info("job.test", {
      qid: "question",
      ignoredObject: { secret: true },
    });
    observability.error("job.failed", new Error("failure\nmessage"), {
      qid: "question",
    });

    assert.equal(observability.newRelicEnabled, true);
    assert.equal(records.length, 2);
    assert.equal(records[0].message, "job.test");
    assert.equal(records[0].qid, "question");
    assert.equal(records[0].ignoredObject, undefined);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].error.message, "failure message");
    assert.deepEqual(errors[0].attributes, {
      event: "job.failed",
      qid: "question",
    });
    assert.equal(JSON.parse(stdout[0]).event, "job.test");
    assert.equal(JSON.parse(stderr[0]).event, "job.failed");
  } finally {
    mock.restoreAll();
    delete require.cache[observabilityPath];
    if (originalNewRelicCache) require.cache[newRelicPath] = originalNewRelicCache;
    else delete require.cache[newRelicPath];
    for (const [name, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
