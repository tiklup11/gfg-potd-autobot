
const codeFetcher = require('./code_fetcher')
const codeSubmitter = require('./code_submitter')
const codeMerger = require('./code_merger.js')

async function main() {

    // const qid = await urlFetcher.fetchPOTD_QID();
    const qid = "44bb5287b98797782162ffe3d2201621f6343a4b"
    const startCode = await codeFetcher.fetchStarterCode(qid)
    const solvedCode = await codeFetcher.fetchSolutionCode(qid)

    const finalCode = codeMerger.mergeCode(solvedCode, startCode)
    const responseCode = await codeSubmitter.submit(solvedCode, finalCode, qid)

    if (responseCode == 1) {
        console.log("success")
    } else {
        console.log("failed")
    }
}




main()