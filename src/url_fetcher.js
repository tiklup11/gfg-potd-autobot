const request = require('request');

const constants = require('./const/constants')


const potdURL = constants.hostName + "/api/v1/problems-of-day/problem/today/"
const problemUrl = '';

function getProblemUrl() {
    return new Promise((resolve, reject) => {
        const options = {
            url: potdURL,
            json: true
        };

        request.get(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body['problem_url']);
                // resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

// https://practice.geeksforgeeks.org/problems/44bb5287b98797782162ffe3d2201621f6343a4b/1
function getQuestionIdFromURL(url) {
    const regex = /problems\/(.*)\/\d+/;
    const id = url.match(regex)[1];
    return id;
}

async function fetchPOTD_QID() {
    const qUrl = await getProblemUrl();
    questionUrl = qUrl
    return getQuestionIdFromURL(qUrl)
}


module.exports = {
    fetchPOTD_QID,
    problemUrl,
}

// console.log(
// getPotdQID()
// );



/**
 * This is the way to execute a promise function
 *  */

// getProblemUrl(potdURL)
//     .then(response => {
//         console.log(response);
//     })
//     .catch(error => {
//         console.log(error);
//     });

