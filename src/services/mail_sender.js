const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 587,
    auth: {
        user: '2019uch0019@iitjammu.ac.in',
        pass: 'elzdnvoziwvpyddu'
    }
});

const mailOptions = {
    from: 'gfg-potd-bot@developed-by-pulkit.com',
    to: '',
    subject: 'GFG-BOT',
    text: '',
    html: ''
};

// sendMail('tiklup1729@gmail.com', "1,2,3,4")


function sendMail(to, message) {
    mailOptions.to = to
    mailOptions.html = makeHTML_Body(message)
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(`Email sent: ${info.response}`);
            }
        });
    })
}


function makeHTML_Body(body) {
    return `<h1>HELLO BOSS</h1><h2>I am Anshuman, gfg-potd-solver-bot created by pulkit</h2><br>${body}`
}