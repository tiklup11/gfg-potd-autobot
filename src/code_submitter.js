const request = require("request");
const { hostName } = require("./const/constants");

const pollingIntervalSeconds = 15;
const maxPollingAttempts = 10;

function submitCode(userCode, code, qid, userCookie) {
  return postMultipart(
    `${hostName}/api/latest/problems/${qid}/compile/`,
    {
      source: "https://practice.geeksforgeeks.org",
      request_type: "solutionCheck",
      userCode,
      code,
      language: "cpp",
    },
    userCookie,
    "submission",
  ).then((body) => {
    const submissionId = body?.results?.submission_id;
    if (!submissionId) {
      throw new Error(
        `GFG submission response did not contain submission_id: ${safeResponse(body)}`,
      );
    }
    return submissionId;
  });
}

function fetchSubmissionResult(submissionId, problemId, userCookie) {
  return postMultipart(
    `${hostName}/api/latest/problems/submission/submit/result/?`,
    {
      sub_id: submissionId,
      sub_type: "solutionCheck",
      pid: String(problemId),
    },
    userCookie,
    "result",
  );
}

async function submit(userCode, code, qid, problemId, userCookie) {
  try {
    const submissionId = await submitCode(userCode, code, qid, userCookie);
    return await pollSubmissionResult(submissionId, problemId, userCookie);
  } catch (error) {
    return { result: false, response: error };
  }
}

async function pollSubmissionResult(submissionId, problemId, userCookie) {
  let lastResponse;

  for (let attempt = 0; attempt < maxPollingAttempts; attempt += 1) {
    await waitForSeconds(pollingIntervalSeconds);
    lastResponse = await fetchSubmissionResult(
      submissionId,
      problemId,
      userCookie,
    );

    if (String(lastResponse?.status).toUpperCase() === "QUEUED") {
      console.log(
        `Submission queued; checking again in ${pollingIntervalSeconds} seconds`,
      );
      continue;
    }

    return formatResult(lastResponse);
  }

  return {
    result: false,
    response: `GFG result was still queued after ${maxPollingAttempts} checks: ${safeResponse(lastResponse)}`,
  };
}

function formatResult(response) {
  if (
    Number(response?.sub_status) === 1 ||
    (response?.status === "calculated" && response?.message === null)
  ) {
    return { result: true, response: "Solved successfully" };
  }

  const expected = response?.message?.file_output;
  const received = response?.message?.code_output;
  if (expected !== undefined || received !== undefined) {
    return {
      result: false,
      response: `Wrong answer (expected: ${expected ?? "unknown"}, received: ${received ?? "unknown"})`,
    };
  }

  return {
    result: false,
    response: `GFG returned ${response?.view_mode || response?.status || "an unknown result"}: ${safeResponse(response)}`,
  };
}

function postMultipart(url, formData, userCookie, operation) {
  return new Promise((resolve, reject) => {
    request(
      {
        url,
        method: "POST",
        formData,
        headers: {
          Accept: "*/*",
          Cookie: userCookie,
          Origin: "https://www.geeksforgeeks.org",
          Referer: "https://www.geeksforgeeks.org/",
        },
      },
      (error, response, body) => {
        if (error) return reject(error);
        if (response.statusCode !== 200) {
          return reject(
            new Error(
              `GFG ${operation} returned HTTP ${response.statusCode}: ${safeResponse(body)}`,
            ),
          );
        }

        try {
          return resolve(JSON.parse(body));
        } catch (parseError) {
          return reject(
            new Error(
              `GFG ${operation} returned invalid JSON: ${safeResponse(body)}`,
              { cause: parseError },
            ),
          );
        }
      },
    );
  });
}

function safeResponse(value) {
  const message = typeof value === "string" ? value : JSON.stringify(value);
  return (message || "empty response").replace(/\s+/g, " ").slice(0, 500);
}

function waitForSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

module.exports = { submit };
