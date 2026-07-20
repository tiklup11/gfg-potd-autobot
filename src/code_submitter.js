const request = require("request");
const { hostName } = require("./const/constants");

const pollingIntervalSeconds = 15;
const maxPollingAttempts = 10;
const requestTimeoutMs = 30_000;

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
      throw new Error("GFG submission response did not contain submission_id");
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
  const submissionId = await submitCode(userCode, code, qid, userCookie);
  return pollSubmissionResult(submissionId, problemId, userCookie);
}

async function pollSubmissionResult(submissionId, problemId, userCookie) {
  for (let attempt = 0; attempt < maxPollingAttempts; attempt += 1) {
    await waitForSeconds(pollingIntervalSeconds);
    const result = await fetchSubmissionResult(
      submissionId,
      problemId,
      userCookie,
    );

    if (String(result?.status).toUpperCase() === "QUEUED") {
      continue;
    }

    return formatResult(result);
  }

  return {
    result: false,
    error: `GFG result was still queued after ${maxPollingAttempts} checks`,
  };
}

function formatResult(response) {
  if (
    Number(response?.sub_status) === 1 ||
    (response?.status === "calculated" && response?.message === null)
  ) {
    return { result: true };
  }

  const expected = response?.message?.file_output;
  const received = response?.message?.code_output;
  if (expected !== undefined || received !== undefined) {
    return {
      result: false,
      error: "GFG judged the submission as a wrong answer",
    };
  }

  return {
    result: false,
    error: `GFG returned ${response?.view_mode || response?.status || "an unknown result"}`,
  };
}

function postMultipart(url, formData, userCookie, operation) {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url,
        formData,
        timeout: requestTimeoutMs,
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
            new Error(`GFG ${operation} returned HTTP ${response.statusCode}`),
          );
        }

        try {
          return resolve(JSON.parse(body));
        } catch (parseError) {
          return reject(
            new Error(`GFG ${operation} returned invalid JSON`, {
              cause: parseError,
            }),
          );
        }
      },
    );
  });
}

function waitForSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

module.exports = { submit };
