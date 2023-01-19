const formatter = require('../format')

const tiklup1729_GFG_Cookie = formatter.formatCookie(require('./tiklup1729_cookie'));
const yash_GFG_Cookie = formatter.formatCookie(require('./yash_cookie'))

const allUsers = [
    {
        name: "Yash BOSS",
        email: "2019ume0203@iitjammu.ac.in",
        cookie: yash_GFG_Cookie
    },
    {
        name: "Pulkit BOSS",
        email: "2019ucs0086@iitjammu.ac.in",
        cookie: tiklup1729_GFG_Cookie
    },
]

module.exports = { allUsers }