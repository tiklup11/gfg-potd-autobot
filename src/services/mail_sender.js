const nodemailer = require("nodemailer");

const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const reportEmail = process.env.REPORT_EMAIL;

async function sendReport({ qid, results }) {
  if (!smtpUser || !smtpPassword || !reportEmail) {
    throw new Error("SMTP_USER, SMTP_PASSWORD, and REPORT_EMAIL are required");
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPassword },
  });
  const successful = results.filter((result) => result.success).length;
  const failed = results.length - successful;
  const lines = results.map((result) =>
    result.success
      ? `${result.email} : success`
      : `${result.email} : ${result.error || "unknown error"}`,
  );
  const summary = `Success: ${successful} | Failed: ${failed}`;
  const text = [`GFG POTD: ${qid}`, summary, "", ...lines].join("\n");
  const htmlLines = lines
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  const info = await transporter.sendMail({
    from: smtpUser,
    to: reportEmail,
    subject: `GFG POTD Report: ${successful}/${results.length} successful`,
    text,
    html: `<h2>GFG POTD: ${escapeHtml(qid)}</h2><p>${summary}</p><ul>${htmlLines}</ul>`,
  });

  console.log(`POTD report sent: ${info.response}`);
  return info;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = { sendReport };
