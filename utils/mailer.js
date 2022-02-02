require("dotenv").config();
const nodemailer = require("nodemailer");

// let testAccount = await nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
    host: process.env.ses_host,
    port: 587,
    secure: false,
    auth: {
        user: process.env.ses_user,
        pass: process.env.ses_password,
    },
});

async function sendEmail(email, emailBody) {

    let info = await transporter.sendMail({
        from: 'ayshan.maredia@gmail.com',
        to: email,
        subject: "Group invitation",
        // text: "Hello world?",
        html: emailBody,
    });

}

module.exports = sendEmail;
