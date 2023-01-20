
const codeFetcher = require('./code_fetcher')
const codeSubmitter = require('./code_submitter')
const codeMerger = require('./code_merger.js')
const urlFetcher = require('./url_fetcher')
const cron = require('node-cron');
const mailSender = require('./services/mail_sender')
const dbService = require('./services/firestore')

const express = require('express')
const app = express()
const router = require('./route')

main()

function main() {
    runSchedular()
    enableWebPageRoutes();
    // executeScript()
}


function enableWebPageRoutes() {
    app.use('/', router);
    app.use('/users', router)

    app.listen(8080, () => {
        console.log('Server running on port 8080');
    });
}

// schedule a job to run every day at 6pm
function runSchedular() {

    const randomHour = Math.floor(Math.random() * (6 - 0 + 1) + 0);
    const timeOfDay = 12 + randomHour

    cron.schedule(`0 0 20 * * *`, () => {
        executeScript()
    });

    // cron.schedule(`0 0 ${timeOfDay} * * *`, () => {
    //     executeScript()
    // });
}

//operations
async function executeScript() {

    console.log("getting potd id....")
    const qid = await urlFetcher.fetchPOTD_QID();
    console.log("POTD ID : ", qid)

    // const qid = "ec277982aea7239b550b28421e00acbb1ea03d2c"
    console.log("getting driver code....")
    const driverCode = await codeFetcher.fetchStarterCode(qid);
    console.log("--------------driver code-------------")
    console.log(driverCode)
    console.log("--------------------------------------")

    console.log("getting solution code....")
    const solutionCode = await codeFetcher.fetchSolutionCode(qid);
    console.log("--------------solution code-----------")
    console.log(solutionCode)
    console.log("--------------------------------------")

    const completeCode = codeMerger.mergeCode(solutionCode, driverCode);

    const allUsers = await dbService.getAllUsers();

    allUsers.forEach(async (user) => {
        console.log("USER LOGING : ", user)
        console.log("doing submittion for ", user.name)
        await submitCodeAndNotify(solutionCode, completeCode, qid, user);
        console.log("submitted.")
    })
}


async function submitCodeAndNotify(solutionCode, completeCode, qid, user) {
    try {
        const { result, response } = await codeSubmitter.submit(solutionCode, completeCode, qid, user.cookie);
        console.log("email response : ", response);
        await mailSender.sendMail(user.email, response);
    } catch (error) {
        console.log(error)
    }

}
