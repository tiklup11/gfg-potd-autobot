const nodemailer = require('nodemailer')
const url_fetcher = require('../url_fetcher')

let date = new Date();
date = date.toLocaleDateString();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    name: 'nodemailer',
    port: 587,
    auth: {
        user: 'gfg.p0td.b0t@gmail.com',
        pass: 'jsjrikvdefuguxaj'
    },
});

const mailOptions = {
    from: 'gfg-potd-bot@developed-by-pulkit.com',
    to: '',
    subject: `GFG-POTD Report [${date}]`,
    text: '',
    html: ''
};

// sendMail('tiklup1729@gmail.com', "1,2,3,4")


async function sendMail(to, message) {
    if (message === null) {
        message = "Some error occured on submiting your POTD for today, Please update your cookies or LOSE your freebies."
    }
    mailOptions.to = to
    mailOptions.html = await makeHTML_Body(message)
    return new Promise((resolve, reject) => {
        try {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error)
                } else {
                    console.log(`Email sent: ${info.response}`);
                    resolve(info)
                }
            });
        } catch (error) {
            reject(error)
        }

    })
}

sendAliveMail();

function sendAliveMail() {
    sendMail("tiklup1729@gmail.com", "Hello BOSS, don't worry, I am alive and will do the POTD after one hour");
}


async function makeHTML_Body(body) {

    // const qUrl = await url_fetcher.getProblemUrl()
    // const qUrl = "https://practice.geeksforgeeks.org/problems/2b70d42632a4e207569c6d2d777383e4603d6fe1/1"
    // const qUrl = "tempurl"
    let date = new Date();
    date = date.toLocaleDateString();

    // console.log("q-url => ", qUrl)
    return `<h1>HELLO BOSS</h1>
    <h2>gfg-potd-solver-bot created by pulkit</h2>
    <br>
    <h4>Report for POTD of ${date}</h4>
    <pre>${body}</pre>`
}

module.exports = { sendMail }
