const request = require("request");

const constants = require("./const/constants");

const potdURL = `${constants.hostName}/api/v1/problems-of-day/problem/today/`;
const problemUrl = "";
const requestTimeoutMs = 30_000;

function getProblemUrl() {
  return new Promise((resolve, reject) => {
    const options = {
      url: potdURL,
      json: true,
      timeout: requestTimeoutMs,
    };

    request.get(options, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode !== 200) {
        return reject(
          new Error(`GFG POTD lookup returned HTTP ${response.statusCode}`),
        );
      }
      if (typeof body?.problem_url !== "string" || !body.problem_url) {
        return reject(new Error("GFG POTD lookup did not contain problem_url"));
      }
      return resolve(body.problem_url);
    });
  });
}

// https://practice.geeksforgeeks.org/problems/44bb5287b98797782162ffe3d2201621f6343a4b/1
function getQuestionIdFromURL(url) {
  const match = url.match(/problems\/(.*)\/\d+/);
  if (!match?.[1]) {
    throw new Error("GFG POTD lookup returned an invalid problem_url");
  }
  return match[1];
}

async function fetchPOTD_QID() {
  const qUrl = await getProblemUrl();
  return getQuestionIdFromURL(qUrl);
}

module.exports = {
  fetchPOTD_QID,
  problemUrl,
  getProblemUrl,
};
