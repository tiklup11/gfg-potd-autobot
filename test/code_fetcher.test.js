const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach, mock } = test;
const request = require("request");

const codeFetcher = require("../src/code_fetcher");

afterEach(() => mock.restoreAll());

test("fetchStarterCode returns starter code and problem ID", async () => {
  mock.method(request, "get", (options, callback) => {
    assert.equal(options.timeout, 30_000);
    assert.equal(options.headers.Cookie, "solution-cookie");
    callback(null, { statusCode: 200 }, {
      results: {
        id: 42,
        extra: { initial_user_func: { cpp: { initial_code: "driver" } } },
      },
    });
  });

  assert.deepEqual(
    await codeFetcher.fetchStarterCode("question", "solution-cookie"),
    { starterCode: "driver", problemId: 42 },
  );
});

test("fetchStarterCode rejects incomplete metadata", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 200 }, { results: {} });
  });

  await assert.rejects(
    codeFetcher.fetchStarterCode("question", "cookie"),
    /did not contain C\+\+ starter code and pid/,
  );
});

test("fetchSolutionCode returns the first C++ solution", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 200 }, {
      results: { hints: [{ full_func: "class Solution {};" }] },
    });
  });

  assert.equal(
    await codeFetcher.fetchSolutionCode("question", "cookie"),
    "class Solution {};",
  );
});

test("fetchSolutionCode rejects a missing solution", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 200 }, { results: { hints: [] } });
  });

  await assert.rejects(
    codeFetcher.fetchSolutionCode("question", "cookie"),
    /did not contain a C\+\+ solution/,
  );
});

test("GFG fetches reject network and HTTP failures", async (t) => {
  await t.test("network failure", async () => {
    mock.method(request, "get", (_options, callback) => {
      callback(new Error("socket timeout"));
    });

    await assert.rejects(
      codeFetcher.fetchStarterCode("question", "cookie"),
      /socket timeout/,
    );
    mock.restoreAll();
  });

  await t.test("HTTP failure", async () => {
    mock.method(request, "get", (_options, callback) => {
      callback(null, { statusCode: 401 }, {});
    });

    await assert.rejects(
      codeFetcher.fetchSolutionCode("question", "cookie"),
      /returned HTTP 401/,
    );
  });
});
