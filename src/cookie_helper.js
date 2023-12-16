const formatter = require("./format");

function convertJSON_CookieToOtherFormat(cookie) {
  if (isJson(cookie)) {
    return formatter.formatCookie(JSON.parse(cookie));
  } else {
    throw "Cookie not in JSON format";
  }
}

function isJson(cookie) {
  try {
    cookie = sanitizeJson(cookie);
    JSON.parse(cookie);
  } catch (error) {
    return false;
  }
  return true;
}

function sanitizeJson(cookie) {
  if (typeof cookie !== "string") {
    throw new Error("Input must be a string");
  }
  return inputString.replace(/\\\"/g, "");

  // Example usage:
  //   const stringWithBackslashDoubleQuotes =
  //     'This is a string with \\" double quotes \\"';

  //   const stringWithoutBackslashDoubleQuotes = removeBackslashDoubleQuotes(
  //     stringWithBackslashDoubleQuotes
  //   );

  //   console.log(stringWithoutBackslashDoubleQuotes);
}

module.exports = { convertJSON_CookieToOtherFormat, isJson };
