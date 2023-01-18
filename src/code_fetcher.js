const request = require('request');

const constants = require('./constants')
const merger = require('./code_merger')

var options = {
    url: '',
    json: true,
    headers: {
        'Cookie': constants.solveCoo
    }
};

function fetchStarterCode(qid) {

    const metaInfoUrl = constants.hostName + "/api/latest/problems/" + qid + "/metainfo/"
    options.url = metaInfoUrl;

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                // console.log("-------------starter------------------------------------------------------")
                // console.log(body['results']['extra']['initial_user_func']['cpp']['initial_code'])
                // console.log("-------------------------------------------------------------------")
                resolve(body['results']['extra']['initial_user_func']['cpp']['initial_code']);
            } else {
                reject(error);
            }
        });
    });
}

function fetchSolutionCode(qid) {

    const solutionUrl = constants.hostName + "/api/latest/problems/" + qid + "/hints/solution/"
    options.url = solutionUrl;

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {

                const results = body['results'];
                //array of objects
                const hints = results['hints'];
                //first object of hints maps to cpp
                const cppCode = hints[0]['full_func']
                // console.log(cppCode)
                resolve(cppCode);
            } else {
                reject(error);
            }
        });
    });
}


async function main() {
    const code = await fetchStarterCode("6eb51dc638ee1b936f38d1ab4b2f7062d4425463")
    const mycode = await fetchSolutionCode("6eb51dc638ee1b936f38d1ab4b2f7062d4425463")
    console.log("------------------code-----------------------")
    console.log(code)
    console.log("------------------mycode---------------------")
    console.log(mycode)
    const merged = merger.mergeCode(mycode, code)
    console.log(merged)
}
main()


module.exports = {
    fetchStarterCode,
    fetchSolutionCode
}
