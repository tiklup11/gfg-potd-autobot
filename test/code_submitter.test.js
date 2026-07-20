const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach, mock } = test;
const request = require("request");

const codeSubmitter = require("../src/code_submitter");

afterEach(() => mock.restoreAll());

function skipPollingWaits() {
  mock.method(globalThis, "setTimeout", (callback) => {
    callback();
    return 0;
  });
}

test("submit compiles, polls, and returns success", async () => {
  skipPollingWaits();
  const calls = [];
  mock.method(request, "post", (options, callback) => {
    calls.push(options);
    assert.equal(options.timeout, 30_000);
    assert.equal(options.headers.Cookie, "user-cookie");

    if (calls.length === 1) {
      callback(null, { statusCode: 200 }, JSON.stringify({
        results: { submission_id: "submission-1" },
      }));
      return;
    }

    callback(null, { statusCode: 200 }, JSON.stringify({
      status: "calculated",
      message: null,
    }));
  });

  assert.deepEqual(
    await codeSubmitter.submit(
      "user code",
      "complete code",
      "question",
      42,
      "user-cookie",
    ),
    { result: true },
  );
  assert.equal(calls.length, 2);
  assert.equal(calls[0].formData.request_type, "solutionCheck");
  assert.equal(calls[1].formData.sub_id, "submission-1");
});

test("submit rejects a compile response without submission_id", async () => {
  mock.method(request, "post", (_options, callback) => {
    callback(null, { statusCode: 200 }, JSON.stringify({ results: {} }));
  });

  await assert.rejects(
    codeSubmitter.submit("user", "complete", "question", 42, "cookie"),
    /did not contain submission_id/,
  );
});

test("submit rejects HTTP failures", async () => {
  mock.method(request, "post", (_options, callback) => {
    callback(null, { statusCode: 429 }, "rate limited");
  });

  await assert.rejects(
    codeSubmitter.submit("user", "complete", "question", 42, "cookie"),
    /submission returned HTTP 429/,
  );
});

test("submit rejects invalid JSON", async () => {
  mock.method(request, "post", (_options, callback) => {
    callback(null, { statusCode: 200 }, "not-json");
  });

  await assert.rejects(
    codeSubmitter.submit("user", "complete", "question", 42, "cookie"),
    /submission returned invalid JSON/,
  );
});

test("submit stops after the maximum queued polling attempts", async () => {
  skipPollingWaits();
  let calls = 0;
  mock.method(request, "post", (_options, callback) => {
    calls += 1;
    const body = calls === 1
      ? { results: { submission_id: "submission-1" } }
      : { status: "QUEUED" };
    callback(null, { statusCode: 200 }, JSON.stringify(body));
  });

  assert.deepEqual(
    await codeSubmitter.submit("user", "complete", "question", 42, "cookie"),
    {
      result: false,
      error: "GFG result was still queued after 10 checks",
    },
  );
  assert.equal(calls, 11);
});

test("submit formats a wrong-answer result without leaking outputs", async () => {
  skipPollingWaits();
  let calls = 0;
  mock.method(request, "post", (_options, callback) => {
    calls += 1;
    const body = calls === 1
      ? { results: { submission_id: "submission-1" } }
      : { message: { file_output: "expected", code_output: "secret output" } };
    callback(null, { statusCode: 200 }, JSON.stringify(body));
  });

  assert.deepEqual(
    await codeSubmitter.submit("user", "complete", "question", 42, "cookie"),
    { result: false, error: "GFG judged the submission as a wrong answer" },
  );
});
