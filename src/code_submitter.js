const constants = require('./constants')

const request = require('request');

const hostName = 'https://practiceapiorigin.geeksforgeeks.org';

const formData = {
    'source': 'https://practice.geeksforgeeks.org',
    'request_type': 'solutionCheck',
    'userCode': '//User function Template for C++\n\n/*\nstruct Node\n{\n    int data;\n    struct Node* left;\n    struct Node* right;\n    \n    Node(int x){\n        data = x;\n        left = right = NULL;\n    }\n};\n */\n\n\nclass Solution\n{\npublic:\n    int maxGCD( Node* root)\n    {\n        return 1;\n    }\n};\n\n',
    'code': '//{ Driver Code Starts\n#include <bits/stdc++.h>\nusing namespace std;\n\nstruct Node\n{\n    int data;\n    struct Node *left;\n    struct Node *right;\n\n    Node(int val) {\n        data = val;\n        left = right = NULL;\n    }\n}; \n\n// } Driver Code Ends\n',
    'language': 'cpp'
};
const cookie = constants.coo

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

    const endpoint = hostName + "/api/latest/problems/" + qid + "/compile/"
    options.url = endpoint

    formData.code = code
    formData.userCode = userCode
    options.formData = formData

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                console.log(body);
                const jsonbody = JSON.parse(body);
                resolve(jsonbody.results.submission_id)
            } else {
                // console.log(error);
                reject(error)
            }
        });
    })
}

function getSubmittionResult(submissionId) {

    const endpoint = hostName + "/api/latest/problems/submission/result/ "
    options.url = endpoint

    const formData = {
        'sub_id': submissionId,
        'sub_type': 'solutionCheck',
    };
    options.formData = formData;

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const jsonbody = JSON.parse(body)

                const subStatus = jsonbody.sub_status
                const returnCode = subStatus == 1 ? 1 : 0;
                resolve(returnCode)
            } else {
                // console.log(error);
                reject(error)
            }
        });
    })
}

async function submit(mycode, code, qid) {
    const subid = await getSubmittionId(mycode, code, qid);
    const res = await getSubmittionResult(subid)
    // console.log(res);
    return res;

}

module.exports = { submit }

// main()

// getSubmittionId("//this is my code", "6eb51dc638ee1b936f38d1ab4b2f7062d4425463")

