const codeFetcher = require("./code_fetcher");
const codeSubmitter = require("./code_submitter");
const codeMerger = require("./code_merger.js");
const urlFetcher = require("./url_fetcher");
const cron = require("node-cron");
const mailSender = require("./services/mail_sender");
const dbService = require("./services/firestore");

const express = require("express");
const app = express();
const router = require("./route");

main();

function main() {
  // runSchedular()
  enableWebPageRoutes();
  // executeScript()
}

//webpage routes
function enableWebPageRoutes() {
  app.use("/", router);
  app.use("/users", router);

  app.get("/run", (req, res) => {
    res.send("running, you will get the mail");
    executeScript();
  });

  app.get("/test", (req, res) => {
    res.send("checking, sending you a alive mail");
    sendAliveMail();
  });

  const port = process.env.PORT || 1289;
  app.listen(port, () => {
    console.log("Server runningggg on port ", port);
  });
}

// executeScript();

// schedule a job to run every day at 6pm
function runSchedular() {
  // const randomHour = Math.floor(Math.random() * (6 - 0 + 1) + 0);
  const randomHour = 3;
  const timeOfDay = 12 + randomHour;
  const oneHourBefore = timeOfDay - 1;

  cron.schedule(`0 0 ${oneHourBefore} * * *`, () => {
    sendAliveMail();
  });

  cron.schedule(`0 0 ${timeOfDay} * * *`, () => {
    executeScript();
  });
}
// sendAliveMail();

function sendAliveMail() {
  mailSender.sendMail("tiklup1729@gmail.com", "Test", "201");
}

//operations
async function executeScript() {
  console.log("getting potd id....");
  const qid = await urlFetcher.fetchPOTD_QID();
  console.log("qid = ", qid);
  // const qid = "asteroid-collision"

  // const qid = "ec277982aea7239b550b28421e00acbb1ea03d2c"
  console.log("getting driver code....");
  const driverCode = await codeFetcher.fetchStarterCode(qid);

  console.log("getting solution code....");
  const solutionCode = await codeFetcher.fetchSolutionCode(qid);

  const completeCode = codeMerger.mergeCode(solutionCode, driverCode);

  const allUsers = await dbService.getAllUsers(qid);

  allUsers.forEach(async (user) => {
    console.log("USER LOGING : ", user);
    console.log("doing submittion for ", user.name);
    await submitCodeAndNotify(solutionCode, completeCode, qid, user);
    console.log("submitted.");
    console.log("waiting for 10 seconds, before moving to next user");
    await waitForSeconds(6);
  });
}

async function waitForSeconds(seconds) {
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

//TODO : add username to mail
async function submitCodeAndNotify(solutionCode, completeCode, qid, user) {
  try {
    const { result, response } = await codeSubmitter.submit(
      solutionCode,
      completeCode,
      qid,
      user.cookie
    );
    console.log("sending mail to ", user.name, " ", user.email);
    // console.log("email body : ", response);
    dbService.updateQuestionCnt(user.email, qid);
    await mailSender.sendMail(user.email, response, user.solved_ques_count);
  } catch (error) {
    console.log(error);
  }
}
