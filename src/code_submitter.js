const constants = require('./const/constants')

const request = require('request');

const hostName = 'https://practiceapiorigin.geeksforgeeks.org';

const formData = {
    'source': 'https://practice.geeksforgeeks.org',
    'request_type': 'solutionCheck',
    'userCode': '',
    'code': '',
    'language': 'cpp'
};
const cookie = constants.tiklup1729_GFG_Cookie

const options = {
    url: '',
    method: 'POST',
    formData: formData,
    headers: {
        'Cookie': cookie,
        'Sec-Ch-Ua': '(Not(A:Brand";v="8", "Chromium";v="101"',
        'Sec-Ch-Ua-Mobile': '?0'
    }
};

function getSubmittionId(userCode, code, qid) {

    initHeaders(qid, code, userCode);

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const jsonbody = JSON.parse(body);
                resolve(jsonbody.results.submission_id)
            } else {
                reject(error)
            }
        });
    })
}

function initHeaders(qid, code, userCode) {
    const endpoint = hostName + "/api/latest/problems/" + qid + "/compile/";
    options.url = endpoint;

    formData.code = code;
    formData.userCode = userCode;
    options.formData = formData;
}

function getSubmittionResult(submissionId) {

    initHeadersAndFormData(submissionId);

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const jsonbody = JSON.parse(body)
                console.log(jsonbody)
                resolve(jsonbody)
            } else {
                reject(error)
            }
        });
    })
}

function initHeadersAndFormData(submissionId) {
    const endpoint = hostName + "/api/latest/problems/submission/result/ ";
    options.url = endpoint;

    const formData = {
        'sub_id': submissionId,
        'sub_type': 'solutionCheck',
    };
    options.formData = formData;
}

async function submit(mycode, code, qid) {
    const subid = await getSubmittionId(mycode, code, qid);

    const res = await submitSolutionAndTryGettingValidStatus(subid)
    return res;
}


async function submitSolutionAndTryGettingValidStatus(subid) {
    var tryingCount = 0;
    var maxTryCount = 5;

    var response = {}
    while (tryingCount < maxTryCount) {

        await waitForSeconds(6)

        // console.log(`trying count : ${tryingCount}`)
        const res = await getSubmittionResult(subid)
        response = res

        if (res.status === "QUEUED") {
            console.log("trying again in 6 seconds")
        } else {
            return formatMessage(response);
        }
        tryingCount++;
    }
    response = JSON.stringify(response, null, 2)

    return { result: false, response: response }
}


function formatMessage(response) {
    var message = response;

    if (message === null) {
        message = "Solved successfully";
    } else {
        message = JSON.stringify(message, 2);
    }

    return { result: true, response: message };
}

async function waitForSeconds(seconds) {
    return await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


module.exports = { submit }

// main()

// getSubmittionId("//this is my code", "6eb51dc638ee1b936f38d1ab4b2f7062d4425463")

