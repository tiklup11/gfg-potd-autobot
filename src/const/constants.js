
const formatter = require('../format')

const tiklup1729_GFG_Cookie = formatter.formatCookie(require('./tiklup1729_cookie').tiklup1729Cookies);
const solution_Cookie = formatter.formatCookie(require('./solution_cookie').solutionCookie);

const hostName = 'https://practiceapi.geeksforgeeks.org'

module.exports = {
    hostName,
    tiklup1729_GFG_Cookie,
    solution_Cookie
};