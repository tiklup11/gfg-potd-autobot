const formatter = require('../format')


const hostName = 'https://practiceapi.geeksforgeeks.org'

const solution_Cookie = formatter.formatCookie(require('./solution_cookie').solutionCookie);

module.exports = {
    hostName,
    solution_Cookie
};