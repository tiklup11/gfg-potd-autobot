const test = require("node:test");
const assert = require("node:assert/strict");
const { afterEach, mock } = test;
const nodemailer = require("nodemailer");

const appConfigPath = require.resolve("../src/appconfig");
const mailSenderPath = require.resolve("../src/services/mail_sender");
const environmentNames = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "REPORT_EMAIL",
];
const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
);

function loadMailSender(environment) {
  for (const name of environmentNames) {
    if (environment[name] === undefined) delete process.env[name];
    else process.env[name] = environment[name];
  }
  delete require.cache[appConfigPath];
  delete require.cache[mailSenderPath];
  return require(mailSenderPath);
}

afterEach(() => {
  mock.restoreAll();
  delete require.cache[appConfigPath];
  delete require.cache[mailSenderPath];
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("sendReport configures bounded SMTP and sends a sanitized report", async () => {
  let transportOptions;
  let sentMessage;
  mock.method(nodemailer, "createTransport", (options) => {
    transportOptions = options;
    return {
      sendMail: async (message) => {
        sentMessage = message;
      },
    };
  });
  const { sendReport } = loadMailSender({
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: "2525",
    SMTP_USER: "bot@example.com",
    SMTP_PASSWORD: "smtp-secret",
    REPORT_EMAIL: "reports@example.com",
  });

  await sendReport({
    qid: "question<&>",
    results: [
      { email: "ok@example.com", success: true },
      { email: "bad@example.com", success: false, error: "failed <check>" },
    ],
  });

  assert.equal(transportOptions.connectionTimeout, 30_000);
  assert.equal(transportOptions.greetingTimeout, 30_000);
  assert.equal(transportOptions.socketTimeout, 30_000);
  assert.equal(transportOptions.auth.user, "bot@example.com");
  assert.equal(sentMessage.to, "reports@example.com");
  assert.match(sentMessage.text, /Success: 1 \| Failed: 1/);
  assert.match(sentMessage.html, /question&lt;&amp;&gt;/);
  assert.match(sentMessage.html, /failed &lt;check&gt;/);
});

test("sendReport rejects missing SMTP credentials", async () => {
  const { sendReport } = loadMailSender({});

  await assert.rejects(
    sendReport({ qid: "question", results: [] }),
    /SMTP_USER, SMTP_PASSWORD, and REPORT_EMAIL are required/,
  );
});

test("sendReport propagates SMTP failures", async () => {
  mock.method(nodemailer, "createTransport", () => ({
    sendMail: async () => {
      throw new Error("SMTP unavailable");
    },
  }));
  const { sendReport } = loadMailSender({
    SMTP_USER: "bot@example.com",
    SMTP_PASSWORD: "smtp-secret",
    REPORT_EMAIL: "reports@example.com",
  });

  await assert.rejects(
    sendReport({ qid: "question", results: [] }),
    /SMTP unavailable/,
  );
});
