const request = require('request');

const constants = require('./const/constants')

const merger = require('./code_merger')

var options = {
    url: '',
    json: true,
    headers: {
        'Cookie': constants.solution_Cookie
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

//e9e2da3de3eb35679ca7e17b752ae877635f1a26
// fetchStarterCode("1646a9b5169d7571cf672f2a31533af083d1f479")

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

////Position this line where user code will be pasted.
async function test() {
    const code = await fetchStarterCode("1646a9b5169d7571cf672f2a31533af083d1f479")
    const mycode = await fetchSolutionCode("1646a9b5169d7571cf672f2a31533af083d1f479")
    // console.log("------------------code-----------------------")
    // console.log(code)
    // console.log("------------------mycode---------------------")
    // console.log(mycode)
    // const merged = merger.mergeCode(mycode, code)
    // console.log(merged)
}
// test()


module.exports = {
    fetchStarterCode,
    fetchSolutionCode
}
