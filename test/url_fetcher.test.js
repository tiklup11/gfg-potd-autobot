const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach, mock } = test;
const request = require("request");

const urlFetcher = require("../src/url_fetcher");

afterEach(() => mock.restoreAll());

test("fetchPOTD_QID extracts the question ID", async () => {
  mock.method(request, "get", (options, callback) => {
    assert.equal(options.timeout, 30_000);
    assert.equal(options.json, true);
    callback(null, { statusCode: 200 }, {
      problem_url: "https://www.geeksforgeeks.org/problems/example-question/1",
    });
  });

  assert.equal(await urlFetcher.fetchPOTD_QID(), "example-question");
});

test("getProblemUrl rejects network failures", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(new Error("network unavailable"));
  });

  await assert.rejects(urlFetcher.getProblemUrl(), /network unavailable/);
});

test("getProblemUrl rejects non-200 responses", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 503 }, {});
  });

  await assert.rejects(urlFetcher.getProblemUrl(), /returned HTTP 503/);
});

test("getProblemUrl rejects a response without problem_url", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 200 }, {});
  });

  await assert.rejects(
    urlFetcher.getProblemUrl(),
    /did not contain problem_url/,
  );
});

test("fetchPOTD_QID rejects an unexpected problem URL", async () => {
  mock.method(request, "get", (_options, callback) => {
    callback(null, { statusCode: 200 }, {
      problem_url: "https://example.com/not-a-problem",
    });
  });

  await assert.rejects(urlFetcher.fetchPOTD_QID(), /invalid problem_url/);
});
