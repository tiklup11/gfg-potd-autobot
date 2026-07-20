const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const usersModulePath = require.resolve("../src/users");
const originalUsersFile = process.env.USERS_FILE;
const originalSolutionUserFile = process.env.SOLUTION_USER_FILE;
const temporaryDirectories = [];

function loadFromFiles(usersContent, solutionUserContent = '{"authHeader":"solution"}') {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "gfg-users-test-"));
  temporaryDirectories.push(directory);
  const usersFile = path.join(directory, "users.json");
  const solutionUserFile = path.join(directory, "solution-user.json");
  fs.writeFileSync(usersFile, usersContent);
  fs.writeFileSync(solutionUserFile, solutionUserContent);
  process.env.USERS_FILE = usersFile;
  process.env.SOLUTION_USER_FILE = solutionUserFile;
  delete require.cache[usersModulePath];
  return require(usersModulePath);
}

test.afterEach(() => {
  delete require.cache[usersModulePath];
  if (originalUsersFile === undefined) delete process.env.USERS_FILE;
  else process.env.USERS_FILE = originalUsersFile;
  if (originalSolutionUserFile === undefined) delete process.env.SOLUTION_USER_FILE;
  else process.env.SOLUTION_USER_FILE = originalSolutionUserFile;
  while (temporaryDirectories.length) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true, force: true });
  }
});

test("loadUsers validates and trims users", () => {
  const { loadUsers } = loadFromFiles(JSON.stringify([
    { email: " user@example.com ", authHeader: " cookie " },
  ]));

  assert.deepEqual(loadUsers(), [
    { email: "user@example.com", authHeader: "cookie" },
  ]);
});

test("loadUsers rejects malformed JSON", () => {
  const { loadUsers } = loadFromFiles("not-json");
  assert.throws(() => loadUsers(), /Unable to read users/);
});

test("loadUsers rejects an empty list", () => {
  const { loadUsers } = loadFromFiles("[]");
  assert.throws(() => loadUsers(), /at least one user/);
});

test("loadUsers rejects missing fields and duplicate emails", async (t) => {
  await t.test("missing authHeader", () => {
    const { loadUsers } = loadFromFiles('[{"email":"user@example.com"}]');
    assert.throws(() => loadUsers(), /requires email and authHeader strings/);
  });

  await t.test("duplicate email", () => {
    const { loadUsers } = loadFromFiles(JSON.stringify([
      { email: "user@example.com", authHeader: "one" },
      { email: "user@example.com", authHeader: "two" },
    ]));
    assert.throws(() => loadUsers(), /duplicate email/);
  });
});

test("loadSolutionAuthHeader trims a valid header", () => {
  const { loadSolutionAuthHeader } = loadFromFiles(
    '[{"email":"user@example.com","authHeader":"cookie"}]',
    '{"authHeader":" solution-cookie "}',
  );

  assert.equal(loadSolutionAuthHeader(), "solution-cookie");
});

test("loadSolutionAuthHeader rejects an empty header", () => {
  const { loadSolutionAuthHeader } = loadFromFiles(
    '[{"email":"user@example.com","authHeader":"cookie"}]',
    '{"authHeader":""}',
  );

  assert.throws(() => loadSolutionAuthHeader(), /non-empty authHeader/);
});
