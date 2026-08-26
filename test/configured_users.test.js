const test = require("node:test");
const assert = require("node:assert/strict");
const { loadUsers, loadSolutionAuthHeader } = require("../src/users");

test("configured credentials are available", () => {
  const users = loadUsers();

  assert.ok(users.length > 0);
  assert.ok(users.every((user) => user.email && user.authHeader));
  assert.ok(loadSolutionAuthHeader());
});
