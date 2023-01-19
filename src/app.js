
const codeFetcher = require('./code_fetcher')
const codeSubmitter = require('./code_submitter')
const codeMerger = require('./code_merger.js')
const urlFetcher = require('./url_fetcher')
const cron = require('node-cron');
const mailSender = require('./services/mail_sender')
const userData = require('./const/users.js')

function main() {
    // runSchedular()
    executeScript()
}

// schedule a job to run every day at 6pm
function runSchedular() {

    const randomHour = Math.floor(Math.random() * (6 - 0 + 1) + 0);
    const timeOfDay = 12 + randomHour

    cron.schedule(`0 0 ${timeOfDay} * * *`, () => {
        executeScript()
    });
}

//operations
async function executeScript() {

    userData.forEach(async (user) => {
        await solveQuestionAndNotify(user.cookie);
    })

}

main()


async function solveQuestionAndNotify(userCookie) {
    const qid = await urlFetcher.fetchPOTD_QID();
    // const qid = "ec277982aea7239b550b28421e00acbb1ea03d2c"
    const driverCode = await codeFetcher.fetchStarterCode(qid);
    const solutionCode = await codeFetcher.fetchSolutionCode(qid);

    const completeCode = codeMerger.mergeCode(solutionCode, driverCode);
    const { result, response } = await codeSubmitter.submit(solutionCode, completeCode, qid, userCookie);
    console.log("email response : ", response);
    mailSender.sendMail("tiklup1729@gmail.com", response);
}
