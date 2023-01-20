const formatter = require('../format')

const tiklup1729_GFG_Cookie = formatter.formatCookie(require('./tiklup1729_cookie'));
const yash_GFG_Cookie = formatter.formatCookie(require('./yash_cookie'))

console.log(tiklup1729_GFG_Cookie)

const allUsers = [
    {
        name: "Yash",
        email: "2019ume0203@iitjammu.ac.in",
        cookie: yash_GFG_Cookie
    },
    {
        name: "Pulkit",
        email: "2019ucs0086@iitjammu.ac.in",
        cookie: tiklup1729_GFG_Cookie
    },
]

module.exports = { allUsers, tiklup1729_GFG_Cookie, yash_GFG_Cookie }