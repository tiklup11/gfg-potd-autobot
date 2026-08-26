const users = require("./configured_users");
const solutionUser = require("./configured_solution_user");

function loadUsers() {
  return users;
}

function loadSolutionAuthHeader() {
  return solutionUser.authHeader;
}

module.exports = { loadUsers, loadSolutionAuthHeader };
