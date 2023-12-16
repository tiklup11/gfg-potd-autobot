
const formatter = require('./format')


const p_cookie = `[
    {
        "name": "sessionid",
        "value": "t4srn94i71qgpwfo37z7daj10owcp6pn",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "strict",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1702738342,
        "storeId": null
    },
    {
        "name": "gfg_ugen",
        "value": "030ef4a52619b493d3cc75d8034e3df378dae231",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1710510749,
        "storeId": null
    },
    {
        "name": "_ga",
        "value": "GA1.1.67481350.1690175941",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1753247941,
        "storeId": null
    },
    {
        "name": "gfg_utype",
        "value": "d9c4e99a174c9471bbbff15488d37a5f4f3607ea",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1710510749,
        "storeId": null
    },
    {
        "name": "gfg_id5_identity",
        "value": "5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1734270749,
        "storeId": null
    },
    {
        "name": "gfguserName",
        "value": "tiklup1729%2FeyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvd3d3LmdlZWtzZm9yZ2Vla3Mub3JnXC8iLCJpYXQiOjE3MDI3MzQ3NDksImV4cCI6MTcxMDUxMDc0OSwiaGFuZGxlIjoidGlrbHVwMTcyOSIsInV1aWQiOiI3NzEwZmEyN2Q3NDliNzY3MDIzNjM5ODYwOGRmYWI2MiIsInByb2ZpbGVVcmwiOiJodHRwczpcL1wvbWVkaWEuZ2Vla3Nmb3JnZWVrcy5vcmdcL2ltZy1wcmFjdGljZVwvdXNlcl93ZWItMTU5ODQzMzIyOC5zdmciLCJpbnN0aXR1dGVJZCI6MTc0MzgsImluc3RpdHV0ZU5hbWUiOiJJbmRpYW4gSW5zdGl0dXRlIG9mIFRlY2hub2xvZ3kgSmFtbXUiLCJuYW1lIjoiUHVsa2l0IiwiaXNJbnRlcmVzdFNlbGVjdGVkIjpmYWxzZSwicHVpZCI6InVXdU9SOTQyMWc9PSIsImFpZCI6IjNnbWVUZGsrMUNuUWVRPT0iLCJwYSI6MX0.hl_sExrONch10EtZfrNL0CxF6n4OPKYvbuzB9fjvHi2a8-V1bFAaFqhoLkqUDrnIKniSCexmgqcVdDrZEqvM4tJnaD57g7JirbFB_LX9Pq8UgCh1XM6tJwXsAeTWxAkvKJKYxnnybt1Nd-d0QLQr2XNqUyVUT8_dxkg470hWfpUIlE2AzmBjyeXH_pbQSpg3UBZnbC-OgSESnK2tbsfjG3AYlgrtvy0GIdO23E9AaAmUaGZwGbAekP7SlDmj2QK5PT_-REcJXpA1lgVWPTJrsi70X3Jl0zvS6P38Llv51N7TOgFgeQMknvxxY7el8_dqo7pJzxa8egkGeT2ap8rk7Q",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1710510749,
        "storeId": null
    },
    {
        "name": "g_state",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1718286748,
        "storeId": null
    },
    {
        "name": "_ga_DWCCJLKX3X",
        "value": "GS1.1.1690175941.1.0.1690175948.53.0.0",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1753247948,
        "storeId": null
    },
    {
        "name": "AKA_A2",
        "value": "A",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1702738337,
        "storeId": null
    },
    {
        "name": "gfg_id5_ipv4",
        "value": "182.66.72.78",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "gfg_id5_user_agent",
        "value": "Mozilla/5.0%20%28Macintosh%3B%20Intel%20Mac%20OS%20X%2010.15%3B%20rv%3A109.0%29%20Gecko/20100101%20Firefox/115.0",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "gfg_nluid",
        "value": "bb2e51a979b011cdc685a3628ced9056",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1721798341,
        "storeId": null
    },
    {
        "name": "gfg_theme",
        "value": "gfgThemeDark",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1771854773,
        "storeId": null
    },
    {
        "name": "gfg_ugy",
        "value": "004be89dd9e070ecb080b9b759e5be29ec24881b",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1710510749,
        "storeId": null
    },
    {
        "name": "gfg_uqual",
        "value": "3dc61d228f88f465788d065e2d0c5b0d92845754",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1710510749,
        "storeId": null
    },
    {
        "name": "http_referrer",
        "value": "https://practice.geeksforgeeks.org/courses",
        "domain": ".geeksforgeeks.org",
        "hostOnly": false,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "PHPSESSID",
        "value": "n6c4nhlv77qkh0lum5tpiidnb1",
        "domain": "auth.geeksforgeeks.org",
        "hostOnly": true,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": "no_restriction",
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    }
]`

// console.log(convertJSON_CookieToOtherFormat(p_cookie))

function convertJSON_CookieToOtherFormat(cookie) {
    if (isJson(cookie)) {
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

module.exports = { convertJSON_CookieToOtherFormat, isJson }