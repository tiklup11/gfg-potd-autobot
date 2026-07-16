#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const cookies = readJson(options.cookies, "Cookie-Editor export");
  const authHeader = createAuthHeader(cookies);
  const outputPath = path.resolve(
    options.output ||
      (options.solution ? "config/solution-user.json" : "config/users.json"),
  );

  if (options.solution) {
    writeJsonAtomically(outputPath, { authHeader });
    console.log(
      `Updated solution account in ${outputPath} (${cookies.length} exported cookies)`,
    );
    return;
  }

  const email = validateEmail(options.email);
  const users = readUsers(outputPath);
  const existingIndex = users.findIndex(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
  const nextUser = { email, authHeader };
  const action = existingIndex === -1 ? "Added" : "Updated";

  if (existingIndex === -1) {
    users.push(nextUser);
  } else {
    users[existingIndex] = nextUser;
  }

  writeJsonAtomically(outputPath, users);
  console.log(
    `${action} ${email} in ${outputPath} (${cookies.length} exported cookies)`,
  );
}

function parseArguments(args) {
  const options = {};
  const names = {
    "--email": "email",
    "-e": "email",
    "--cookies": "cookies",
    "-c": "cookies",
    "--output": "output",
    "-o": "output",
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true };
    }
    if (argument === "--solution") {
      options.solution = true;
      continue;
    }
    const name = names[argument];
    if (!name) throw new Error(`Unknown argument: ${argument}`);
    const value = args[index + 1];
    if (!value || value.startsWith("-")) {
      throw new Error(`${argument} requires a value`);
    }
    options[name] = value;
    index += 1;
  }

  if (!options.cookies || (!options.solution && !options.email)) {
    throw new Error(
      options.solution
        ? "--cookies is required"
        : "--email and --cookies are required",
    );
  }
  return options;
}

function validateEmail(value) {
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required");
  }
  return email;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
  } catch (error) {
    throw new Error(
      `Unable to read ${label} from ${filePath}: ${error.message}`,
    );
  }
}

function createAuthHeader(cookies) {
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error("Cookie-Editor export must be a non-empty JSON array");
  }

  const nowInSeconds = Date.now() / 1000;
  const activeCookies = new Map();

  for (const [index, cookie] of cookies.entries()) {
    if (!cookie || typeof cookie !== "object") {
      throw new Error(`Cookie entry ${index + 1} must be an object`);
    }
    const domain = String(cookie.domain || "")
      .replace(/^\./, "")
      .toLowerCase();
    if (
      domain !== "geeksforgeeks.org" &&
      !domain.endsWith(".geeksforgeeks.org")
    ) {
      throw new Error(`Cookie entry ${index + 1} is not for geeksforgeeks.org`);
    }
    if (
      typeof cookie.name !== "string" ||
      !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(cookie.name)
    ) {
      throw new Error(`Cookie entry ${index + 1} has an invalid name`);
    }
    if (typeof cookie.value !== "string" || /[;\r\n]/.test(cookie.value)) {
      throw new Error(`Cookie entry ${index + 1} has an invalid value`);
    }
    if (
      typeof cookie.expirationDate === "number" &&
      cookie.expirationDate <= nowInSeconds
    ) {
      continue;
    }
    activeCookies.set(cookie.name, cookie.value);
  }

  if (activeCookies.size === 0) {
    throw new Error("Cookie-Editor export contains no active GFG cookies");
  }

  return [...activeCookies]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function readUsers(outputPath) {
  if (!fs.existsSync(outputPath)) return [];
  const users = readJson(outputPath, "users file");
  if (!Array.isArray(users)) {
    throw new Error(`${outputPath} must contain a JSON array`);
  }
  for (const [index, user] of users.entries()) {
    if (
      !user ||
      typeof user.email !== "string" ||
      typeof user.authHeader !== "string"
    ) {
      throw new Error(`Existing users entry ${index + 1} is invalid`);
    }
  }
  return users;
}

function writeJsonAtomically(outputPath, value) {
  const directory = path.dirname(outputPath);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(outputPath)}.${process.pid}.tmp`,
  );

  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    fs.renameSync(temporaryPath, outputPath);
    fs.chmodSync(outputPath, 0o600);
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath);
    } catch {}
    throw error;
  }
}

function printUsage() {
  console.log(`Usage:
  npm run user:upsert -- --email user@example.com --cookies /path/to/export.json
  npm run solution:set -- --cookies /path/to/export.json

Options:
  -e, --email     User email address
  -c, --cookies   Cookie-Editor JSON export file
  -o, --output    Override the output path
      --solution  Write the dedicated solution account instead of a user`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
