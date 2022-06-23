const { createTransport } = require('nodemailer');
const config = require('../config');

async function sendNotification(from, subject, html, to = [], cc = [], bcc = []) {

    if (!to?.length) {
        throw new Error('Missing recipient');
    }

    if (!html) {
        throw new Error('Missing HTML CONTENTS');
    }

    to = asArray(to);
    cc = asArray(cc);
    bcc = asArray(bcc);

    return await sendMail({ from, to, cc, bcc, subject, html });
}

async function sendMail(params) {
    const transport = createTransport(config.email_transport);
    console.log("Generating email to: "+params.to.join(', '));
    if (config.emails_enabled){
        try{
            let result = await transport.sendMail(params);
            console.log("Email sent");
            return result;
        }
        catch (err){
            console.log("Email failed to send");
            return err;
        }
    }
    else {
        console.log("Email not sent, email is disabled by configuration");
        return true;
    }
}

function asArray(values = []) {
    return Array.isArray(values)
        ? values
        : [values];
}

module.exports = { sendNotification }
