const fs = require("fs");
const path = require("path");

const usersFile = process.env.USERS_FILE || path.resolve("config/users.json");
const solutionUserFile =
  process.env.SOLUTION_USER_FILE || path.resolve("config/solution-user.json");

function loadUsers() {
  let users;
  try {
    users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read users from ${usersFile}`, { cause: error });
  }

  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("users.json must contain at least one user");
  }

  const seenEmails = new Set();
  return users.map((user, index) => {
    if (
      !user ||
      typeof user.email !== "string" ||
      typeof user.authHeader !== "string"
    ) {
      throw new Error(
        `users.json entry ${index + 1} requires email and authHeader strings`,
      );
    }
    const email = user.email.trim();
    const authHeader = user.authHeader.trim();
    if (!email || !authHeader) {
      throw new Error(
        `users.json entry ${index + 1} cannot contain empty values`,
      );
    }
    if (seenEmails.has(email)) {
      throw new Error(`users.json contains duplicate email: ${email}`);
    }
    seenEmails.add(email);
    return { email, authHeader };
  });
}

function loadSolutionAuthHeader() {
  let solutionUser;
  try {
    solutionUser = JSON.parse(fs.readFileSync(solutionUserFile, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read solution user from ${solutionUserFile}`, {
      cause: error,
    });
  }

  if (
    !solutionUser ||
    typeof solutionUser.authHeader !== "string" ||
    !solutionUser.authHeader.trim()
  ) {
    throw new Error("solution-user.json requires a non-empty authHeader");
  }
  return solutionUser.authHeader.trim();
}

module.exports = { loadUsers, loadSolutionAuthHeader };
