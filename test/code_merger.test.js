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

test("mergeCode inserts the solution before main when the marker is missing", () => {
  const driverCode = "#include <vector>\nusing namespace std;\n\nint main() {}";

  assert.equal(
    mergeCode("class Solution {};\n\n", driverCode),
    "#include <vector>\nusing namespace std;\n\nclass Solution {};\n\nint main() {}",
  );
});

test("mergeCode rejects starter code without a marker or main function", () => {
  assert.throws(
    () => mergeCode("solution", "invalid driver"),
    /did not contain the user-code marker or main function/,
  );
});

test("mergeCode inserts at the first marker", () => {
  const driverCode = `${marker}\nmiddle\n${marker}`;

  assert.equal(
    mergeCode("solution\n", driverCode),
    `solution\n${marker}\nmiddle\n${marker}`,
  );
});
