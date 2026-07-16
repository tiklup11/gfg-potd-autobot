const request = require("request");
const { hostName } = require("./const/constants");

async function fetchStarterCode(qid, authHeader) {
  const body = await fetchJson(
    `${hostName}/api/latest/problems/${qid}/metainfo/`,
    authHeader,
  );
  const starterCode =
    body?.results?.extra?.initial_user_func?.cpp?.initial_code;
  const problemId = body?.results?.id;

  if (!starterCode || !problemId) {
    throw new Error("GFG metadata did not contain C++ starter code and pid");
  }

  return { starterCode, problemId };
}

async function fetchSolutionCode(qid, authHeader) {
  const body = await fetchJson(
    `${hostName}/api/latest/problems/${qid}/hints/solution/`,
    authHeader,
  );
  const solution = body?.results?.hints?.[0]?.full_func;
  if (!solution) {
    throw new Error("GFG response did not contain a C++ solution");
  }
  return solution;
}

function fetchJson(url, authHeader) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url,
        json: true,
        headers: { Cookie: authHeader },
      },
      (error, response, body) => {
        if (error) return reject(error);
        if (response.statusCode !== 200) {
          return reject(
            new Error(`GFG fetch returned HTTP ${response.statusCode}`),
          );
        }
        return resolve(body);
      },
    );
  });
}

module.exports = { fetchStarterCode, fetchSolutionCode };
