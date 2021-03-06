require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.host,
    port: 2525,
    secure: false,
    auth: {
        user: process.env.user,
        pass: process.env.password,
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

async function sendGroupEmail(email, groupEmailBody) {

    let info = await transporter.sendMail({
        from: 'ayshan.maredia@gmail.com',
        to: email,
        subject: "Added to the group",
        // text: "Hello world?",
        html: groupEmailBody,
    });
}

module.exports = { sendEmail, sendGroupEmail };
