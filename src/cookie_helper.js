
const formatter = require('./format')

function validator(cookie) {
    return isJson(cookie)
}

function convertJSON_CookieToOtherFormat(cookie) {
    if (validator(cookie)) {
        return formatter.formatCookie(JSON.parse(cookie))
    } else {
        throw "Cookie not in JSON format"
    }
}


function isJson(cookie) {
    try {
        JSON.parse(cookie)
    } catch (error) {
        return false
    }
    return true
}

module.exports = { convertJSON_CookieToOtherFormat, validator, isJson }