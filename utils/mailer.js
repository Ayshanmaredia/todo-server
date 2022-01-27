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

console.log("Message sent: %s", info.messageId);

export function sendEmail() {

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

}
