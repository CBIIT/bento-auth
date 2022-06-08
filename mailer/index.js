"use strict";
const nodemailer = require("nodemailer");

module.exports = {
    /*

        Sends an email to the provided recipient

        Arguments:
        - recipient {array of strings} -- recipients of the email
        - subject {string} -- The email's subject
        - contents {string} -- The email's contents

     */
    sendEmail: async (recipient, subject, contents) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: config.mailerHost,
            port: config.mailerPort,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.mailerUser, // generated ethereal user
                pass: config.mailerPassword, // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: config.servericeEmail, // sender address
            to: "ming.ying@nih.gov", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    }
};