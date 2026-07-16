const http = require("http");
const cron = require("node-cron");
const codeFetcher = require("./code_fetcher");
const codeSubmitter = require("./code_submitter");
const codeMerger = require("./code_merger");
const urlFetcher = require("./url_fetcher");
const mailSender = require("./services/mail_sender");
const { loadUsers, loadSolutionAuthHeader } = require("./users");

const schedule = process.env.CRON_SCHEDULE || "0 15,18,21,23 * * *";
const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";
const port = Number(process.env.PORT || 1289);
let jobRunning = false;

const arguments = process.argv.slice(2);
const runOnceIndex = arguments.indexOf("--run-once");

if (runOnceIndex !== -1) {
  const email = arguments[runOnceIndex + 1];
  if (!email || email.startsWith("--")) {
    console.error("Usage: npm run run:once -- user@example.com [--no-email]");
    process.exitCode = 1;
  } else {
    runJob({
      targetEmail: email,
      sendEmail: !arguments.includes("--no-email"),
    }).then((successful) => {
      process.exitCode = successful ? 0 : 1;
    });
  }
} else {
  startScheduler();
}

function startScheduler() {
  if (!cron.validate(schedule)) {
    throw new Error(`Invalid CRON_SCHEDULE: ${schedule}`);
  }

  cron.schedule(schedule, () => void runJob(), { timezone });
  console.log(`POTD job scheduled with '${schedule}' in ${timezone}`);

  http
    .createServer((req, res) => {
      if (req.url !== "/healthz") {
        res.writeHead(404);
        return res.end("not found");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    })
    .listen(port, () => console.log(`Health server listening on port ${port}`));
}

async function runJob({ targetEmail, sendEmail = true } = {}) {
  if (jobRunning) {
    console.log("Skipping POTD job because the previous run is still active");
    return;
  }

  jobRunning = true;
  let users = [];
  let qid = "unknown";
  let results = [];

  try {
    users = loadUsers();
    if (targetEmail) {
      users = users.filter(
        (user) => user.email.toLowerCase() === targetEmail.toLowerCase(),
      );
      if (users.length === 0) {
        throw new Error(`User not found in users.json: ${targetEmail}`);
      }
    }

    qid = await urlFetcher.fetchPOTD_QID();
    const sourceAuthHeader = loadSolutionAuthHeader();
    const { starterCode: driverCode, problemId } =
      await codeFetcher.fetchStarterCode(
        qid,
        sourceAuthHeader,
      );
    const solutionCode = await codeFetcher.fetchSolutionCode(
      qid,
      sourceAuthHeader,
    );
    const completeCode = codeMerger.mergeCode(solutionCode, driverCode);

    for (const user of users) {
      results.push(
        await submitForUser(
          user,
          solutionCode,
          completeCode,
          qid,
          problemId,
        ),
      );
      await waitForSeconds(6);
    }
  } catch (error) {
    const message = errorMessage(error);
    console.error("POTD job failed", message);
    results = users.map((user) => ({
      email: user.email,
      success: false,
      error: message,
    }));
  }

  printResults(qid, results);
  if (sendEmail) {
    try {
      await mailSender.sendReport({ qid, results });
    } catch (error) {
      console.error("Failed to send POTD report", errorMessage(error));
    }
  }

  jobRunning = false;
  return results.length > 0 && results.every((result) => result.success);
}

async function submitForUser(
  user,
  solutionCode,
  completeCode,
  qid,
  problemId,
) {
  try {
    const submission = await codeSubmitter.submit(
      solutionCode,
      completeCode,
      qid,
      problemId,
      user.authHeader,
    );

    if (!submission.result) {
      throw new Error(errorMessage(submission.response));
    }

    console.log(`POTD submitted for ${user.email}`);
    return { email: user.email, success: true };
  } catch (error) {
    const message = errorMessage(error);
    console.error(`POTD submission failed for ${user.email}: ${message}`);
    return { email: user.email, success: false, error: message };
  }
}

function errorMessage(error) {
  let message;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    try {
      message = JSON.stringify(error) || "Unknown error";
    } catch {
      message = "Unknown error";
    }
  }

  return message.replace(/\s+/g, " ").trim().slice(0, 1000) || "Unknown error";
}

function waitForSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function printResults(qid, results) {
  const successful = results.filter((result) => result.success).length;
  console.log(`GFG POTD ${qid}: ${successful}/${results.length} successful`);
  for (const result of results) {
    console.log(
      `${result.email} : ${result.success ? "success" : result.error || "unknown error"}`,
    );
  }
}
