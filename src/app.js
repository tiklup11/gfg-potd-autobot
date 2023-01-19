
const codeFetcher = require('./code_fetcher')
const codeSubmitter = require('./code_submitter')
const codeMerger = require('./code_merger.js')
const urlFetcher = require('./url_fetcher')
const cron = require('node-cron');

function main() {
    runSchedular()
}

// schedule a job to run every day at 6pm
function runSchedular() {
    cron.schedule('0 0 18 * * *', () => {
        executeScript()
    });
}

//operations
async function executeScript() {
    const qid = await urlFetcher.fetchPOTD_QID();
    const startCode = await codeFetcher.fetchStarterCode(qid)
    const solvedCode = await codeFetcher.fetchSolutionCode(qid)

    const finalCode = codeMerger.mergeCode(solvedCode, startCode)
    const responseCode = await codeSubmitter.submit(solvedCode, finalCode, qid)
}

main()