const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const router = express.Router()

const db_service = require('./services/firestore')
const formatter = require('./format')

router.use(express.static(path.join(__dirname, 'public')));

router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/adduser.html') // serve the HTML page
})

router.get('/update_cookie', (req, res) => {
    res.sendFile(__dirname + '/update.html') // serve the HTML page
})

router.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/styles.css'));
});


router.post('/adduser', async (req, res) => {

    var { name, email, cookie, adminpassword, userpass } = req.body;

    if (checkValidations(name, email, cookie, userpass) === false) {
        return res.send("All fields are required")
    }

    if (isJson(cookie) === false) {
        return res.send("Cookie must be in JSON format, use Cookie-editor extension to get cookies")
    }

    if (adminpassword === "niceone") {
        cookie = formatter.formatCookie(JSON.parse(cookie))
        await db_service.addUserToFirestore({ name: name, email: email, cookie: cookie, userpass: userpass })
        return res.send('User added')
    } else {
        return res.send("Admin Pass required")
    }

})

function checkValidations(name, email, cookie, userpass) {
    if (name.trim() === "" || email.trim() === "" || cookie.trim() === "" || userpass.trim() === "") {
        return false;
    }
    return true;
}


router.post('/update_cookie', async (req, res) => {

    var { email, cookie, userpass } = req.body;

    if (isJson(cookie) === false) {
        return res.send("Cookie must be in JSON format, use Cookie-editor extension to get cookies")
    }
    return res.send(await db_service.updateCookie(cookie, email, userpass))

})

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}



module.exports = router