const test = require("node:test");
const assert = require("node:assert/strict");

const { mergeCode } = require("../src/code_merger");

const marker = "//Position this line where user code will be pasted.";

test("mergeCode inserts the solution before the GFG marker", () => {
  const driverCode = `before\n${marker}\nafter`;

  assert.equal(
    mergeCode("solution\n", driverCode),
    `before\nsolution\n${marker}\nafter`,
  );
});

test("mergeCode fails immediately when the GFG marker is missing", () => {
  assert.throws(
    () => mergeCode("solution", "driver without marker"),
    /GFG starter code did not contain the user-code marker/,
  );
});

test("mergeCode inserts at the first marker", () => {
  const driverCode = `${marker}\nmiddle\n${marker}`;

  assert.equal(
    mergeCode("solution\n", driverCode),
    `solution\n${marker}\nmiddle\n${marker}`,
  );
});
