"use strict";
const nodemailer = require("nodemailer");
const config = require("../config");
const {sendNotification} = require("../services/notify");

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
        let info = await sendNotification({
            from: config.email.SERVICE_EMAIL,
            to: recipient,
            // cc: [],
            // bcc: [],
            subject: subject,
            html: contents,
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
};