const observability = require("./observability");
const http = require("http");
const cron = require("node-cron");
const codeFetcher = require("./code_fetcher");
const codeSubmitter = require("./code_submitter");
const codeMerger = require("./code_merger");
const urlFetcher = require("./url_fetcher");
const mailSender = require("./services/mail_sender");
const { loadUsers, loadSolutionAuthHeader } = require("./users");
const appConfig = require("./appconfig");

const schedule = appConfig.cronSchedule;
const timezone = appConfig.cronTimezone;
const port = appConfig.port;
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
      trigger: "manual",
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

  cron.schedule(schedule, () => void runJob({ trigger: "cron" }), { timezone });
  observability.info("scheduler.started", {
    schedule,
    timezone,
    newRelicEnabled: observability.newRelicEnabled,
  });

  const healthServer = http.createServer((req, res) => {
    if (req.url !== "/healthz") {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  });
  healthServer.on("error", (error) => {
    observability.error("health_server.failed", error, { port });
    process.exit(1);
  });
  healthServer.listen(port, () =>
    observability.info("health_server.started", { port }),
  );
}

async function runJob({
  targetEmail,
  sendEmail = true,
  trigger = "unknown",
} = {}) {
  if (jobRunning) {
    observability.warn("job.skipped", { reason: "previous_run_active" });
    return;
  }

  jobRunning = true;
  const startedAt = Date.now();
  let users = [];
  let qid = "unknown";
  let results = [];

  observability.info("job.started", {
    trigger,
    targetEmail: targetEmail || "all",
    sendEmail,
  });

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
    observability.info("job.users_loaded", { userCount: users.length });

    qid = await urlFetcher.fetchPOTD_QID();
    observability.info("job.problem_loaded", { qid });
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

    for (const [index, user] of users.entries()) {
      observability.info("submission.started", {
        email: user.email,
        qid,
        userNumber: index + 1,
        userCount: users.length,
      });
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
    observability.error("job.failed", error, { qid, trigger });
    results = users.map((user) => ({
      email: user.email,
      success: false,
      error: message,
    }));
  }

  printResults(qid, results);
  if (sendEmail) {
    try {
      observability.info("report_email.started", { qid });
      await mailSender.sendReport({ qid, results });
      observability.info("report_email.sent", { qid });
    } catch (error) {
      observability.error("report_email.failed", error, { qid });
    }
  }

  jobRunning = false;
  const successful = results.filter((result) => result.success).length;
  const success = results.length > 0 && successful === results.length;
  observability.info("job.completed", {
    qid,
    success,
    successful,
    failed: results.length - successful,
    durationMs: Date.now() - startedAt,
  });
  return success;
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
      throw new Error(submission.error || "GFG submission failed");
    }

    observability.info("submission.succeeded", { email: user.email, qid });
    return { email: user.email, success: true };
  } catch (error) {
    const message = errorMessage(error);
    observability.error("submission.failed", error, {
      email: user.email,
      qid,
    });
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
    message = "Unknown error";
  }

  return message.replace(/\s+/g, " ").trim().slice(0, 1000) || "Unknown error";
}

function waitForSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function printResults(qid, results) {
  const successful = results.filter((result) => result.success).length;
  observability.info("job.summary", {
    qid,
    successful,
    failed: results.length - successful,
    userCount: results.length,
  });
}
