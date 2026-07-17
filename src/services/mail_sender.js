const nodemailer = require("nodemailer");
const { smtp } = require("../appconfig");

async function sendReport({ qid, results }) {
  if (!smtp.user || !smtp.password || !smtp.reportEmail) {
    throw new Error("SMTP_USER, SMTP_PASSWORD, and REPORT_EMAIL are required");
  }
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: false,
    auth: { user: smtp.user, pass: smtp.password },
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
    from: smtp.user,
    to: smtp.reportEmail,
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
