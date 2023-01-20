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

const options = {
    url: '',
    method: 'POST',
    formData: formData,
    headers: {
        Cookie: '',
        'Sec-Ch-Ua': '(Not(A:Brand";v="8", "Chromium";v="101"',
        'Sec-Ch-Ua-Mobile': '?0'
    }
};

function getSubmittionId(userCode, code, qid, userCookie) {

    initOptionsAndHeader(qid, code, userCode, userCookie);

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

function initOptionsAndHeader(qid, code, userCode, userCookie) {
    const endpoint = hostName + "/api/latest/problems/" + qid + "/compile/";
    options.url = endpoint;

    formData.code = code;
    formData.userCode = userCode;
    options.formData = formData;
    options.headers = {
        'Cookie': userCookie,
        'Sec-Ch-Ua': '(Not(A:Brand";v="8", "Chromium";v="101"',
        'Sec-Ch-Ua-Mobile': '?0'
    }
}

function getSubmittionResult(submissionId, userCookie) {

    initHeadersAndFormData(submissionId, userCookie);

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

function initHeadersAndFormData(submissionId, userCookie) {
    const endpoint = hostName + "/api/latest/problems/submission/result/ ";
    options.url = endpoint;

    const formData = {
        'sub_id': submissionId,
        'sub_type': 'solutionCheck',
    };
    options.formData = formData;
    options.headers = {
        'Cookie': userCookie,
        'Sec-Ch-Ua': '(Not(A:Brand";v="8", "Chromium";v="101"',
        'Sec-Ch-Ua-Mobile': '?0'
    }


}

async function submit(mycode, code, qid, userCookie) {
    var res = {};
    try {
        const subid = await getSubmittionId(mycode, code, qid, userCookie);
        res = await submitSolutionAndTryGettingValidStatus(subid, userCookie)
    } catch (error) {
        res = { result: false, response: error }
    }
    return res;
}


async function submitSolutionAndTryGettingValidStatus(subid, userCookie) {
    var tryingCount = 0;
    var maxTryCount = 10;

    var response = {}
    while (tryingCount < maxTryCount) {

        await waitForSeconds(10)

        // console.log(`trying count : ${tryingCount}`)
        const res = await getSubmittionResult(subid, userCookie)
        response = res

        if (res.status === "QUEUED") {
            console.log("trying again in 10 seconds")
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

